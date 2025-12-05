import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { transformImage } from '@/lib/flux/client'
import { generateDescriptions } from '@/lib/claude/client'
import { FALLBACK_DESCRIPTION } from '@/lib/prompts'
import { InventoryObject } from '@/types'

interface UploadInput {
  id: string
  originalUrl: string
}

interface ProcessResult {
  objects: InventoryObject[]
  errors: string[]
}

// POST /api/process - Process uploaded images with FLUX and Claude
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { uploads } = body as { uploads: UploadInput[] }

    if (!uploads || uploads.length === 0) {
      return NextResponse.json({ error: 'No uploads provided' }, { status: 400 })
    }

    const supabase = createServerClient()
    const result: ProcessResult = { objects: [], errors: [] }

    // Step 1: Run FLUX transformations first (produces 1024x1024 images)
    const transformResults = await Promise.all(
      uploads.map(async (upload) => {
        try {
          const transformedUrl = await transformImage(upload.originalUrl, userId)
          return { id: upload.id, transformedUrl }
        } catch (error) {
          console.error(`FLUX error for ${upload.id}:`, error)
          return { id: upload.id, transformedUrl: null }
        }
      })
    )

    // Step 2: Build URLs for Claude - prefer transformed (smaller) images
    const urlsForClaude = uploads.map((upload, i) =>
      transformResults[i].transformedUrl || upload.originalUrl
    )

    // Step 3: Run Claude descriptions with smaller images
    const descriptionsMap = await generateDescriptions(urlsForClaude)

    // Create database records for each processed image
    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i]
      const transformResult = transformResults[i]
      const description = descriptionsMap.get(urlsForClaude[i]) || FALLBACK_DESCRIPTION

      try {
        const { data: object, error: insertError } = await supabase
          .from('objects')
          .insert({
            user_id: userId,
            original_image_url: upload.originalUrl,
            transformed_image_url: transformResult.transformedUrl,
            description,
            status: 'active',
          })
          .select()
          .single()

        if (insertError) {
          console.error(`DB insert error for ${upload.id}:`, insertError)
          result.errors.push(`Failed to save object ${upload.id}`)
          continue
        }

        result.objects.push(object as InventoryObject)
      } catch (error) {
        console.error(`Processing error for ${upload.id}:`, error)
        result.errors.push(`Failed to process ${upload.id}`)
      }
    }

    if (result.objects.length === 0) {
      return NextResponse.json(
        { error: 'All processing failed', details: result.errors },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Process API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

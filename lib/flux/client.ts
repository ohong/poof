import { createServerClient, getStorageUrl } from '@/lib/supabase/server'
import { FLUX_TRANSFORM_PROMPT } from '@/lib/prompts'

const BFL_API_KEY = process.env.BFL_API_KEY!
const BFL_API_BASE = 'https://api.bfl.ml/v1'

interface FluxSubmitResponse {
  id: string
}

interface FluxResultResponse {
  id: string
  status: 'Ready' | 'Pending' | 'Error' | 'Request Moderated' | 'Content Moderated' | 'Task not found'
  result?: {
    sample: string // URL to generated image
  }
}

/**
 * Transform an image using FLUX Kontext API
 * @param imageUrl - Public URL of the original image
 * @param userId - User ID for storage path
 * @returns Public URL of the transformed image, or null on failure
 */
export async function transformImage(imageUrl: string, userId: string): Promise<string | null> {
  try {
    // Step 1: Submit the transformation job
    const submitResponse = await fetch(`${BFL_API_BASE}/flux-kontext-pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-key': BFL_API_KEY,
      },
      body: JSON.stringify({
        prompt: FLUX_TRANSFORM_PROMPT,
        input_image: imageUrl,
        aspect_ratio: '1:1',
        output_format: 'jpeg',
        safety_tolerance: 2,
      }),
    })

    if (!submitResponse.ok) {
      console.error('FLUX submit failed:', submitResponse.status, await submitResponse.text())
      return null
    }

    const submitData: FluxSubmitResponse = await submitResponse.json()
    const requestId = submitData.id

    // Step 2: Poll for result (max 60 seconds)
    const maxAttempts = 60
    const pollInterval = 1000 // 1 second

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval))

      const resultResponse = await fetch(`${BFL_API_BASE}/get_result?id=${requestId}`, {
        headers: {
          'x-key': BFL_API_KEY,
        },
      })

      if (!resultResponse.ok) {
        console.error('FLUX poll failed:', resultResponse.status)
        continue
      }

      const resultData: FluxResultResponse = await resultResponse.json()

      if (resultData.status === 'Ready' && resultData.result?.sample) {
        // Step 3: Download the transformed image
        const imageResponse = await fetch(resultData.result.sample)
        if (!imageResponse.ok) {
          console.error('Failed to download transformed image')
          return null
        }

        const imageBuffer = await imageResponse.arrayBuffer()

        // Step 4: Upload to Supabase Storage
        const supabase = createServerClient()
        const fileId = crypto.randomUUID()
        const filePath = `transformed/${userId}/${fileId}.jpg`

        const { error: uploadError } = await supabase.storage
          .from('object-images')
          .upload(filePath, imageBuffer, {
            contentType: 'image/jpeg',
            upsert: false,
          })

        if (uploadError) {
          console.error('Supabase upload failed:', uploadError)
          return null
        }

        return getStorageUrl(filePath)
      }

      if (resultData.status === 'Error' ||
          resultData.status === 'Request Moderated' ||
          resultData.status === 'Content Moderated' ||
          resultData.status === 'Task not found') {
        console.error('FLUX processing failed:', resultData.status)
        return null
      }

      // Status is 'Pending', continue polling
    }

    console.error('FLUX transformation timed out')
    return null
  } catch (error) {
    console.error('FLUX transformation error:', error)
    return null
  }
}

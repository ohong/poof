import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { ObjectStatus } from '@/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH /api/objects/[id] - Update object status (for Poof! actions)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: ObjectStatus }

    // Validate status
    const validStatuses: ObjectStatus[] = ['active', 'sold', 'donated', 'tossed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServerClient()

    // First verify user owns this object
    const { data: existing, error: fetchError } = await supabase
      .from('objects')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 })
    }

    if (existing.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the object
    const { data: updated, error: updateError } = await supabase
      .from('objects')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update object:', updateError)
      return NextResponse.json({ error: 'Failed to update object' }, { status: 500 })
    }

    return NextResponse.json({ object: updated })
  } catch (error) {
    console.error('Object update API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

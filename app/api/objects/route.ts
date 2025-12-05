import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET /api/objects - Get user's active objects
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: objects, error } = await supabase
      .from('objects')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch objects:', error)
      return NextResponse.json({ error: 'Failed to fetch objects' }, { status: 500 })
    }

    return NextResponse.json({ objects })
  } catch (error) {
    console.error('Objects API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

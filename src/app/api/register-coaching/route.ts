import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// This route uses the SERVICE ROLE key to bypass RLS
// so we can create coaching + membership during registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, instituteName, slug, phone } = body

    if (!userId || !instituteName || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // Admin client bypasses RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 1. Create coaching
    const { data: coachingData, error: coachingError } = await supabaseAdmin
      .from('coachings')
      .insert({
        name: instituteName,
        slug,
        phone: phone || null,
        owner_id: userId,
      })
      .select()
      .single()

    if (coachingError) {
      return NextResponse.json({ error: coachingError.message }, { status: 400 })
    }

    // 2. Add user as coaching_owner member
    const { error: memberError } = await supabaseAdmin
      .from('coaching_members')
      .insert({
        coaching_id: coachingData.id,
        profile_id: userId,
        role: 'coaching_owner',
      })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, coachingId: coachingData.id })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

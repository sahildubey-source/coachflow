import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTeacher() {
  const email = 'teacher@coachflow.com'
  const password = 'password123'

  console.log(`Creating Teacher user: ${email}`)

  // 1. Get the first available coaching institute
  const { data: coachings, error: coachingErr } = await adminClient
    .from('coachings')
    .select('id, name')
    .limit(1)

  if (coachingErr || !coachings || coachings.length === 0) {
    console.error('No coaching institutes found! Please register an institute first via the UI.')
    process.exit(1)
  }

  const targetCoaching = coachings[0]
  console.log(`Assigning to coaching institute: ${targetCoaching.name}`)

  // 2. Create auth user
  const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'teacher' }
  })

  let userId;

  if (createErr) {
    if (createErr.message.includes('already been registered')) {
      console.log('User already exists! Resetting role...')
      const { data: usersData } = await adminClient.auth.admin.listUsers()
      const existingUser = usersData.users.find(u => u.email === email)
      if (existingUser) {
        userId = existingUser.id
      }
    } else {
      console.error('Failed to create user:', createErr)
      process.exit(1)
    }
  } else {
    userId = user.user.id
  }

  // 3. Ensure profile role is teacher
  await adminClient.from('profiles').update({ role: 'teacher', full_name: 'Test Teacher' }).eq('id', userId)

  // 4. Add to coaching_members if not already there
  const { data: existingMember } = await adminClient
    .from('coaching_members')
    .select('id')
    .eq('coaching_id', targetCoaching.id)
    .eq('profile_id', userId)
    .single()

  if (!existingMember) {
    await adminClient.from('coaching_members').insert({
      coaching_id: targetCoaching.id,
      profile_id: userId,
      role: 'teacher',
      is_active: true
    })
  }

  console.log('\n✅ Teacher created successfully!')
  console.log('--------------------------------')
  console.log(`Email:    ${email}`)
  console.log(`Password: ${password}`)
  console.log(`Assigned: ${targetCoaching.name}`)
  console.log('--------------------------------')
}

createTeacher()

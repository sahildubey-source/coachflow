import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createStudentUser() {
  const email = 'student@coachflow.com'
  const password = 'password123'

  console.log(`Creating Student user: ${email}`)

  // 1. Get first available coaching
  const { data: coachings } = await adminClient.from('coachings').select('id, name').limit(1)
  if (!coachings || coachings.length === 0) {
    console.error('No coaching found!')
    process.exit(1)
  }
  const coaching = coachings[0]
  console.log(`Coaching: ${coaching.name}`)

  // 2. Get first student record to link to
  const { data: students } = await adminClient
    .from('students')
    .select('id, full_name, profile_id')
    .eq('coaching_id', coaching.id)
    .limit(1)

  // 3. Create auth user
  const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
    email, password, email_confirm: true
  })

  let userId
  if (createErr) {
    if (createErr.message.includes('already been registered')) {
      const { data: usersData } = await adminClient.auth.admin.listUsers()
      const existing = usersData.users.find(u => u.email === email)
      userId = existing?.id
      console.log('User already exists, using existing.')
    } else {
      console.error('Failed:', createErr)
      process.exit(1)
    }
  } else {
    userId = user.user.id
  }

  // 4. Set profile role to student
  await adminClient.from('profiles').update({
    role: 'student',
    full_name: students?.[0]?.full_name ?? 'Test Student'
  }).eq('id', userId)

  // 5. Link profile_id on the student record if one exists and has no profile linked
  if (students && students.length > 0 && !students[0].profile_id) {
    await adminClient.from('students').update({ profile_id: userId }).eq('id', students[0].id)
    console.log(`Linked to student record: ${students[0].full_name}`)
  } else if (students && students.length > 0 && students[0].profile_id) {
    console.log('Student already has a profile_id. Updating to test user...')
    await adminClient.from('students').update({ profile_id: userId }).eq('id', students[0].id)
  } else {
    console.log('No student records found. The student portal will show empty data until a student is added by the owner.')
  }

  console.log('\n✅ Student user ready!')
  console.log('--------------------------------')
  console.log(`Email:    ${email}`)
  console.log(`Password: ${password}`)
  console.log(`Portal:   /student`)
  console.log('--------------------------------')
}

createStudentUser()

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

async function createSuperAdmin() {
  const email = 'admin@coachflow.com'
  const password = 'password123'

  console.log(`Creating Super Admin user: ${email}`)

  // 1. Create auth user
  const { data: user, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'super_admin' }
  })

  if (createErr) {
    if (createErr.message.includes('already been registered')) {
      console.log('User already exists! Updating role to super_admin...')
      // Find the user by email
      const { data: usersData } = await adminClient.auth.admin.listUsers()
      const existingUser = usersData.users.find(u => u.email === email)
      
      if (existingUser) {
        await adminClient.from('profiles').update({ role: 'super_admin' }).eq('id', existingUser.id)
        console.log('Role updated to super_admin successfully.')
      }
    } else {
      console.error('Failed to create user:', createErr)
    }
  } else {
    // 2. Ensure profile role is super_admin
    await adminClient.from('profiles').update({ role: 'super_admin' }).eq('id', user.user.id)
    console.log('Super Admin user created successfully!')
  }
}

createSuperAdmin()

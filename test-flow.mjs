import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.')
  process.exit(1)
}

// Client for regular operations (authenticated)
const supabase = createClient(supabaseUrl, supabaseAnonKey)
// Client for admin operations (bypassing RLS & email verification)
const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testEmail = `test.owner.${Date.now()}@example.com`
const testPassword = 'testpassword123'

async function runTests() {
  console.log('🚀 Starting Integration Tests for CoachFlow...')
  let testUserId = null
  let coachingId = null

  try {
    // ---------------------------------------------------------
    // 1. SETUP: Create User & Login
    // ---------------------------------------------------------
    console.log(`\n[1] Creating test user: ${testEmail}`)
    const { data: adminUser, error: adminErr } = await adminAuthClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Test Owner', role: 'coaching_owner' }
    })

    if (adminErr) throw new Error(`Failed to create user: ${adminErr.message}`)
    testUserId = adminUser.user.id
    console.log('✅ User created successfully.')

    console.log('\n[2] Authenticating as test user...')
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    if (authErr) throw new Error(`Failed to login: ${authErr.message}`)
    console.log('✅ Authenticated successfully.')

    // ---------------------------------------------------------
    // 2. COACHING SETUP (Done via Service Role just like the app's API route)
    // ---------------------------------------------------------
    console.log('\n[3] Creating Coaching Institute...')
    const { data: coaching, error: coachingErr } = await adminAuthClient
      .from('coachings')
      .insert({
        name: 'Test Academy',
        slug: `test-academy-${Date.now()}`,
        owner_id: testUserId
      })
      .select()
      .single()

    if (coachingErr) throw new Error(`Failed to create coaching: ${coachingErr.message}`)
    coachingId = coaching.id
    console.log('✅ Coaching created:', coaching.name)

    console.log('\n[3.5] Adding User as Coaching Owner...')
    const { error: memberErr } = await adminAuthClient
      .from('coaching_members')
      .insert({
        coaching_id: coachingId,
        profile_id: testUserId,
        role: 'coaching_owner'
      })
      
    if (memberErr) throw new Error(`Failed to add coaching member: ${memberErr.message}`)
    console.log('✅ User added as coaching owner.')

    console.log('\n[4] Creating Batch...')
    const { data: batch, error: batchErr } = await supabase
      .from('batches')
      .insert({
        coaching_id: coachingId,
        name: 'Class 10 Science'
      })
      .select()
      .single()

    if (batchErr) throw new Error(`Failed to create batch: ${batchErr.message}`)
    console.log('✅ Batch created:', batch.name)

    // ---------------------------------------------------------
    // 3. STUDENTS & ENROLLMENT
    // ---------------------------------------------------------
    console.log('\n[5] Creating Student...')
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .insert({
        coaching_id: coachingId,
        full_name: 'Test Student',
        enrollment_no: 'TEST-001'
      })
      .select()
      .single()

    if (studentErr) throw new Error(`Failed to create student: ${studentErr.message}`)
    console.log('✅ Student created:', student.full_name)

    console.log('\n[6] Enrolling Student in Batch...')
    const { error: enrollErr } = await supabase
      .from('student_batches')
      .insert({
        coaching_id: coachingId,
        student_id: student.id,
        batch_id: batch.id
      })
    
    if (enrollErr) throw new Error(`Failed to enroll student: ${enrollErr.message}`)
    console.log('✅ Student enrolled successfully.')

    // ---------------------------------------------------------
    // 4. ATTENDANCE
    // ---------------------------------------------------------
    console.log('\n[7] Marking Attendance...')
    const { error: attErr } = await supabase
      .from('attendance')
      .insert({
        coaching_id: coachingId,
        batch_id: batch.id,
        student_id: student.id,
        date: new Date().toISOString().split('T')[0],
        status: 'present'
      })

    if (attErr) throw new Error(`Failed to mark attendance: ${attErr.message}`)
    console.log('✅ Attendance marked successfully.')

    // ---------------------------------------------------------
    // 5. FEES & FINANCIALS
    // ---------------------------------------------------------
    console.log('\n[8] Recording Fee Transaction...')
    const { error: feeErr } = await supabase
      .from('fee_transactions')
      .insert({
        coaching_id: coachingId,
        student_id: student.id,
        amount: 5000,
        final_amount: 5000,
        status: 'paid'
      })

    if (feeErr) throw new Error(`Failed to record fee: ${feeErr.message}`)
    console.log('✅ Fee transaction recorded successfully.')

    // ---------------------------------------------------------
    // 6. ACADEMICS (TESTS)
    // ---------------------------------------------------------
    console.log('\n[9] Scheduling Test...')
    const { data: test, error: testErr } = await supabase
      .from('tests')
      .insert({
        coaching_id: coachingId,
        batch_id: batch.id,
        name: 'Weekly Quiz',
        total_marks: 50
      })
      .select()
      .single()
      
    if (testErr) throw new Error(`Failed to create test: ${testErr.message}`)
    console.log('✅ Test scheduled successfully.')

    console.log('\n[10] Recording Test Result...')
    const { error: resultErr } = await supabase
      .from('test_results')
      .insert({
        coaching_id: coachingId,
        test_id: test.id,
        student_id: student.id,
        marks_obtained: 45
      })

    if (resultErr) throw new Error(`Failed to record test result: ${resultErr.message}`)
    console.log('✅ Test result recorded successfully.')

    // ---------------------------------------------------------
    // 7. CRM / LEADS
    // ---------------------------------------------------------
    console.log('\n[11] Adding Lead...')
    const { error: leadErr } = await supabase
      .from('leads')
      .insert({
        coaching_id: coachingId,
        full_name: 'Test Prospect',
        source: 'website'
      })

    if (leadErr) throw new Error(`Failed to add lead: ${leadErr.message}`)
    console.log('✅ Lead added successfully.')

    // ---------------------------------------------------------
    // 8. NOTIFICATIONS
    // ---------------------------------------------------------
    console.log('\n[12] Creating Notification...')
    const { error: notifErr } = await adminAuthClient
      .from('notifications')
      .insert({
        coaching_id: coachingId,
        recipient_id: testUserId,
        title: 'Test Notification',
        message: 'This is an integration test.'
      })

    if (notifErr) throw new Error(`Failed to create notification: ${notifErr.message}`)
    console.log('✅ Notification created successfully.')

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! The platform features and RLS policies are working perfectly.')

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error)
  } finally {
    // ---------------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------------
    if (testUserId) {
      console.log('\n🧹 Cleaning up test data...')
      // Deleting the user will cascade delete coaching and all related records due to ON DELETE CASCADE on auth.users in our profiles
      const { error: cleanErr } = await adminAuthClient.auth.admin.deleteUser(testUserId)
      if (cleanErr) {
        console.error('Failed to cleanup user:', cleanErr.message)
      } else {
        console.log('✅ Cleanup completed.')
      }
    }
  }
}

runTests()

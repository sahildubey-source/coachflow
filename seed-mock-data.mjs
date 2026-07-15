import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const COACHING_ID = '56a399c7-4b8e-4e3b-b343-fe7a112a0541'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🌱 Starting comprehensive seed...\n')

  // ─── 1. BATCHES ───────────────────────────────────────────────────────────
  console.log('📚 Creating batches...')
  const batchData = [
    { coaching_id: COACHING_ID, name: 'JEE Morning Batch', subject: 'Physics, Chemistry, Maths', days_of_week: ['Mon', 'Wed', 'Fri'], start_time: '07:00', end_time: '09:00', max_students: 30, is_active: true, start_date: '2024-04-01' },
    { coaching_id: COACHING_ID, name: 'NEET Evening Batch', subject: 'Biology, Chemistry', days_of_week: ['Tue', 'Thu', 'Sat'], start_time: '17:00', end_time: '19:00', max_students: 25, is_active: true, start_date: '2024-04-01' },
    { coaching_id: COACHING_ID, name: 'Class 10 Board Batch', subject: 'All Subjects', days_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], start_time: '14:00', end_time: '16:00', max_students: 40, is_active: true, start_date: '2024-04-01' },
  ]
  const { data: newBatches, error: batchErr } = await admin.from('batches').insert(batchData).select('id')
  if (batchErr) { console.error('Batch error:', batchErr.message); }
  else console.log(`  ✅ Created ${newBatches.length} batches`)

  // Get all batches (including pre-existing)
  const { data: allBatches } = await admin.from('batches').select('id').eq('coaching_id', COACHING_ID).eq('is_active', true).limit(5)
  const batchIds = allBatches.map(b => b.id)

  // ─── 2. STUDENTS ──────────────────────────────────────────────────────────
  console.log('\n👨‍🎓 Creating students...')
  const studentNames = [
    'Aarav Sharma', 'Priya Patel', 'Rahul Gupta', 'Ananya Singh', 'Karan Mehta',
    'Sneha Joshi', 'Arjun Kumar', 'Divya Nair', 'Rohan Verma', 'Pooja Yadav',
    'Vikram Reddy', 'Neha Agarwal', 'Siddharth Bose', 'Meera Pillai', 'Amit Tiwari',
  ]
  const studentData = studentNames.map((name, i) => ({
    coaching_id: COACHING_ID,
    batch_ids: [batchIds[i % batchIds.length]],
    full_name: name,
    email: `${name.toLowerCase().replace(/ /g, '.')}@student.com`,
    phone: `98${String(randomBetween(10000000, 99999999))}`,
    enrollment_no: `ENR-2024-${String(i + 1).padStart(3, '0')}`,
    date_of_birth: `200${randomBetween(4, 7)}-0${randomBetween(1, 9)}-${String(randomBetween(1, 28)).padStart(2, '0')}`,
    parent_name: `${name.split(' ')[1]} (Parent)`,
    parent_phone: `97${String(randomBetween(10000000, 99999999))}`,
    admission_date: daysAgo(randomBetween(60, 180)),
    is_active: true,
  }))

  const { data: newStudents, error: studentErr } = await admin.from('students').insert(studentData).select('id, full_name')
  if (studentErr) { console.error('Student error:', studentErr.message) }
  else console.log(`  ✅ Created ${newStudents.length} students`)

  const { data: allStudents } = await admin.from('students').select('id').eq('coaching_id', COACHING_ID).limit(20)
  const studentIds = allStudents.map(s => s.id)

  // ─── 3. ATTENDANCE (last 30 days) ────────────────────────────────────────
  console.log('\n📅 Creating attendance records...')
  const statusOptions = ['present', 'present', 'present', 'present', 'absent', 'late']
  const attendanceRecords = []

  for (let day = 30; day >= 1; day--) {
    const date = daysAgo(day)
    const dow = new Date(date).getDay()
    if (dow === 0 || dow === 6) continue // skip weekends

    for (const studentId of studentIds.slice(0, 12)) {
      attendanceRecords.push({
        coaching_id: COACHING_ID,
        batch_id: batchIds[0],
        student_id: studentId,
        date,
        status: statusOptions[randomBetween(0, statusOptions.length - 1)],
      })
    }
  }

  // Chunk inserts
  const CHUNK = 150
  let attendInserted = 0
  for (let i = 0; i < attendanceRecords.length; i += CHUNK) {
    const { error } = await admin.from('attendance').upsert(
      attendanceRecords.slice(i, i + CHUNK),
      { onConflict: 'student_id,date' }
    )
    if (error) console.error('  Attendance chunk error:', error.message)
    else attendInserted += Math.min(CHUNK, attendanceRecords.length - i)
  }
  console.log(`  ✅ Created ~${attendInserted} attendance records (${attendanceRecords.length} total)`)

  // ─── 4. FEE STRUCTURES ────────────────────────────────────────────────────
  console.log('\n💰 Getting fee structures...')
  const { data: allFeeStructures } = await admin.from('fee_structures').select('id').eq('coaching_id', COACHING_ID)
  const feeStructureIds = allFeeStructures.map(f => f.id)
  console.log(`  ✅ Found ${feeStructureIds.length} fee structures`)

  // ─── 5. FEE TRANSACTIONS ─────────────────────────────────────────────────
  console.log('\n💳 Creating fee transactions...')
  if (feeStructureIds.length > 0) {
    const feeTransactions = studentIds.slice(0, 12).flatMap((studentId, i) => [
      {
        coaching_id: COACHING_ID,
        student_id: studentId,
        fee_structure_id: feeStructureIds[Math.min(3, feeStructureIds.length - 1)],
        amount: 1000, final_amount: 1000, discount: 0,
        status: 'paid', notes: 'Registration fee',
      },
      {
        coaching_id: COACHING_ID,
        student_id: studentId,
        fee_structure_id: feeStructureIds[0],
        amount: 3500, final_amount: 3500, discount: 0,
        status: i < 7 ? 'paid' : 'pending', notes: 'June 2024 tuition fee',
      },
      {
        coaching_id: COACHING_ID,
        student_id: studentId,
        fee_structure_id: feeStructureIds[0],
        amount: 3500, final_amount: 3500, discount: 0,
        status: i < 4 ? 'paid' : i < 9 ? 'pending' : 'overdue', notes: 'July 2024 tuition fee',
      },
    ])
    const { error: feeErr } = await admin.from('fee_transactions').insert(feeTransactions)
    if (feeErr) console.error('  Fee error:', feeErr.message)
    else console.log(`  ✅ Created ${feeTransactions.length} fee transactions`)
  }

  // ─── 6. TESTS ─────────────────────────────────────────────────────────────
  console.log('\n📝 Creating tests...')
  const testData = [
    { coaching_id: COACHING_ID, batch_id: batchIds[0], name: 'Unit Test 1 – Physics', subject: 'Physics', test_date: daysAgo(25), total_marks: 100, passing_marks: 35 },
    { coaching_id: COACHING_ID, batch_id: batchIds[0], name: 'Chemistry Mid-Term', subject: 'Chemistry', test_date: daysAgo(14), total_marks: 100, passing_marks: 40 },
    { coaching_id: COACHING_ID, batch_id: batchIds[1], name: 'Biology Assessment 1', subject: 'Biology', test_date: daysAgo(8), total_marks: 50, passing_marks: 18 },
    { coaching_id: COACHING_ID, batch_id: batchIds[0], name: 'Maths Practice Test', subject: 'Mathematics', test_date: daysAgo(2), total_marks: 80, passing_marks: 28 },
  ]
  const { data: newTests, error: testErr } = await admin.from('tests').insert(testData).select('id, total_marks')
  if (testErr) console.error('  Test error:', testErr.message)
  else console.log(`  ✅ Created ${newTests.length} tests`)

  const { data: allTests } = await admin.from('tests').select('id, total_marks').eq('coaching_id', COACHING_ID).limit(10)
  const testList = allTests ?? []

  // ─── 7. TEST RESULTS ──────────────────────────────────────────────────────
  console.log('\n🏆 Creating test results...')
  const testResults = []
  for (const test of testList.slice(0, 4)) {
    for (const studentId of studentIds.slice(0, 10)) {
      const maxM = test.total_marks ?? 100
      const marks = randomBetween(Math.floor(maxM * 0.38), maxM)
      const pct = marks / maxM
      const grade = pct >= 0.9 ? 'A+' : pct >= 0.8 ? 'A' : pct >= 0.7 ? 'B' : pct >= 0.6 ? 'C' : 'F'
      testResults.push({
        coaching_id: COACHING_ID,
        test_id: test.id,
        student_id: studentId,
        marks_obtained: marks,
        grade,
        remarks: grade === 'A+' ? 'Excellent!' : grade === 'F' ? 'Needs improvement' : null,
      })
    }
  }
  const { error: trErr } = await admin.from('test_results').insert(testResults)
  if (trErr) console.error('  Test results error:', trErr.message)
  else console.log(`  ✅ Created ${testResults.length} test results`)

  // ─── 8. CRM LEADS ─────────────────────────────────────────────────────────
  console.log('\n🎯 Creating CRM leads...')
  const leadData = [
    { coaching_id: COACHING_ID, full_name: 'Suresh Kumar', email: 'suresh@gmail.com', phone: '9811223344', status: 'new', source: 'website', interested_in: 'JEE Preparation', notes: 'Interested in JEE morning batch' },
    { coaching_id: COACHING_ID, full_name: 'Kavya Reddy', email: 'kavya.r@gmail.com', phone: '9922334455', status: 'contacted', source: 'referral', interested_in: 'NEET Preparation', notes: 'Called on 12 July, sending brochure' },
    { coaching_id: COACHING_ID, full_name: 'Mohit Jain', phone: '9733445566', status: 'follow_up', source: 'walk_in', interested_in: 'Class 10 Board', notes: 'Visited, needs scholarship info', follow_up_date: daysAgo(-2) },
    { coaching_id: COACHING_ID, full_name: 'Riya Shah', email: 'riya.shah@gmail.com', phone: '9644556677', status: 'converted', source: 'social_media', interested_in: 'JEE Preparation', notes: 'Enrolled in July batch' },
    { coaching_id: COACHING_ID, full_name: 'Ashish Pandey', phone: '9555667788', status: 'lost', source: 'google', interested_in: 'NEET Preparation', notes: 'Joined competitor institute' },
    { coaching_id: COACHING_ID, full_name: 'Tanvi Malhotra', email: 'tanvi@gmail.com', phone: '9466778899', status: 'new', source: 'referral', interested_in: 'Class 10 Board', notes: 'Referred by Aarav Sharma' },
    { coaching_id: COACHING_ID, full_name: 'Dev Choudhary', phone: '9377889900', status: 'contacted', source: 'website', interested_in: 'JEE Preparation', notes: 'Demo class scheduled this Friday' },
    { coaching_id: COACHING_ID, full_name: 'Sana Mirza', email: 'sana.m@gmail.com', phone: '9288990011', status: 'follow_up', source: 'google', interested_in: 'NEET Preparation', notes: 'Requested fee structure details', follow_up_date: daysAgo(-1) },
  ]
  const { error: leadErr } = await admin.from('leads').insert(leadData)
  if (leadErr) console.error('  Leads error:', leadErr.message)
  else console.log(`  ✅ Created ${leadData.length} CRM leads`)

  // ─── 9. LINK STUDENT USER ─────────────────────────────────────────────────
  console.log('\n🔗 Linking student account...')
  const { data: authUsers } = await admin.auth.admin.listUsers()
  const studentUser = authUsers.users.find(u => u.email === 'student@coachflow.com')
  if (studentUser && studentIds.length > 0) {
    await admin.from('students').update({ profile_id: studentUser.id }).eq('id', studentIds[0])
    console.log(`  ✅ Linked student@coachflow.com → ${studentNames[0]}`)
  }

  console.log('\n\n🎉 ALL DONE! Here\'s what was seeded:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📚 Batches:           3 (JEE, NEET, Class 10)')
  console.log('👨‍🎓 Students:          15 (with parents, phones, DOBs)')
  console.log('📅 Attendance:        ~20 days × 12 students')
  console.log('💰 Fee Structures:    4 tiers')
  console.log('💳 Fee Transactions:  36 (mixed paid/pending/overdue)')
  console.log('📝 Tests:             4 subjects')
  console.log('🏆 Test Results:      40 (with grades A+/A/B/C/F)')
  console.log('🎯 CRM Leads:         8 (across all statuses)')
  console.log('🔗 Student login:     student@coachflow.com → Aarav Sharma')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(console.error)

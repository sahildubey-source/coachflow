export type UserRole = 'super_admin' | 'coaching_owner' | 'teacher' | 'parent' | 'student'
export type PlanType = 'free' | 'starter' | 'growth' | 'enterprise'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'
export type FeeStatus = 'pending' | 'paid' | 'overdue' | 'waived'
export type LeadStatus = 'new' | 'contacted' | 'follow_up' | 'converted' | 'lost'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
export type NotificationType = 'fee_reminder' | 'attendance_alert' | 'test_result' | 'announcement' | 'general'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Coaching {
  id: string
  name: string
  slug: string
  logo_url?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  phone?: string
  email?: string
  website?: string
  owner_id?: string
  plan: PlanType
  subscription_status: SubscriptionStatus
  trial_ends_at?: string
  max_students: number
  max_teachers: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CoachingMember {
  id: string
  coaching_id: string
  profile_id: string
  role: UserRole
  is_active: boolean
  joined_at: string
  profile?: Profile
  coaching?: Coaching
}

export interface Batch {
  id: string
  coaching_id: string
  name: string
  subject?: string
  description?: string
  teacher_id?: string
  start_time?: string
  end_time?: string
  days_of_week?: string[]
  start_date?: string
  end_date?: string
  max_students?: number
  fee_amount?: number
  is_active: boolean
  created_at: string
  updated_at: string
  teacher?: Profile
}

export interface Student {
  id: string
  coaching_id: string
  profile_id?: string
  enrollment_no?: string
  full_name: string
  email?: string
  phone?: string
  date_of_birth?: string
  gender?: string
  address?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  batch_ids?: string[]
  admission_date?: string
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  coaching_id: string
  batch_id: string
  student_id: string
  date: string
  status: AttendanceStatus
  marked_by?: string
  notes?: string
  created_at: string
  student?: Student
}

export interface FeeTransaction {
  id: string
  coaching_id: string
  student_id: string
  fee_structure_id?: string
  amount: number
  discount: number
  final_amount: number
  status: FeeStatus
  due_date?: string
  paid_date?: string
  payment_method?: string
  transaction_ref?: string
  notes?: string
  created_at: string
  updated_at: string
  student?: Student
}

export interface Test {
  id: string
  coaching_id: string
  batch_id?: string
  name: string
  subject?: string
  test_date?: string
  total_marks: number
  passing_marks?: number
  description?: string
  created_by?: string
  created_at: string
}

export interface TestResult {
  id: string
  coaching_id: string
  test_id: string
  student_id: string
  marks_obtained?: number
  grade?: string
  remarks?: string
  is_absent: boolean
  created_at: string
  student?: Student
  test?: Test
}

export interface Lead {
  id: string
  coaching_id: string
  full_name: string
  phone?: string
  email?: string
  source?: string
  interested_in?: string
  status: LeadStatus
  assigned_to?: string
  follow_up_date?: string
  notes?: string
  converted_student_id?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  coaching_id: string
  recipient_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  metadata?: Record<string, unknown>
  created_at: string
}

// Auth context types
export interface AuthUser {
  id: string
  email: string
  profile: Profile
  coachingMember?: CoachingMember
  coaching?: Coaching
}

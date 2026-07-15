'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, CoachingMember, Coaching } from '@/lib/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  coachingMember: CoachingMember | null
  coaching: Coaching | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  coachingMember: null,
  coaching: null,
  loading: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [coachingMember, setCoachingMember] = useState<CoachingMember | null>(null)
  const [coaching, setCoaching] = useState<Coaching | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  async function fetchUserData(userId: string) {
    if (!supabase) return
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (profileData) setProfile(profileData)

      const { data: memberData } = await supabase
        .from('coaching_members')
        .select('*, coaching:coachings(*)')
        .eq('profile_id', userId)
        .eq('is_active', true)
        .single()

      if (memberData) {
        setCoachingMember(memberData)
        setCoaching(memberData.coaching as Coaching)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  useEffect(() => {
    // No Supabase configured — skip auth, treat as unauthenticated
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserData(session.user.id)
      } else {
        setProfile(null)
        setCoachingMember(null)
        setCoaching(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, coachingMember, coaching, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

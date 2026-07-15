'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, GraduationCap, Loader2, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const registerSchema = z.object({
  instituteName: z.string().min(2, 'Institute name must be at least 2 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setAuthError(null)
    const supabase = createClient()

    if (!supabase) {
      setAuthError('Supabase is not configured. Add credentials to .env.local and restart the server.')
      return
    }

    // 1. Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: 'coaching_owner',
        },
      },
    })

    if (signUpError) {
      setAuthError(signUpError.message)
      return
    }

    if (!authData.user) {
      setAuthError('Something went wrong. Please try again.')
      return
    }

    // 2. Create coaching via server API (bypasses RLS with service role)
    const slug = slugify(data.instituteName) + '-' + Math.random().toString(36).slice(2, 6)
    const res = await fetch('/api/register-coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: authData.user.id,
        instituteName: data.instituteName,
        slug,
        phone: data.phone,
      }),
    })

    const result = await res.json()
    if (!res.ok) {
      setAuthError('Coaching setup failed: ' + (result.error || 'Unknown error'))
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Card className="border border-border/50 shadow-xl">
          <CardContent className="pt-10 pb-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 160), oklch(0.75 0.18 150))' }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Account Created!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Please check your email to verify your account, then sign in.
            </p>
            <Link
              id="btn-go-login"
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium text-white transition-colors"
              style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.53 0.28 272))' }}
            >
              Go to Login
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.63 0.22 274))' }}>
          <GraduationCap className="text-white w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">CoachFlow</h1>
        <p className="text-sm text-muted-foreground mt-1">Start your 14-day free trial</p>
      </div>

      <Card className="border border-border/50 shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Register your institute</CardTitle>
          <CardDescription>Set up your coaching in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
              >
                {authError}
              </motion.div>
            )}

            {/* Institute name */}
            <div className="space-y-1.5">
              <Label htmlFor="instituteName">
                <Building2 className="inline w-3.5 h-3.5 mr-1" />
                Institute Name
              </Label>
              <Input
                id="instituteName"
                placeholder="Sharma Classes"
                {...register('instituteName')}
                className={errors.instituteName ? 'border-destructive' : ''}
              />
              {errors.instituteName && <p className="text-xs text-destructive">{errors.instituteName.message}</p>}
            </div>

            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Your Full Name</Label>
              <Input
                id="fullName"
                placeholder="Rajesh Sharma"
                {...register('fullName')}
                className={errors.fullName ? 'border-destructive' : ''}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            {/* Email + Phone row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  {...register('password')}
                  className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              id="btn-register"
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.53 0.28 272))' }}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up...</>
              ) : (
                'Create Account & Institute'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

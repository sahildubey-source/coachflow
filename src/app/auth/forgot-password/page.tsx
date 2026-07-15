'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { GraduationCap, Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.63 0.22 274))' }}>
          <GraduationCap className="text-white w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">CoachFlow</h1>
      </div>

      <Card className="border border-border/50 shadow-xl shadow-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>
            {sent ? "Check your email for a reset link." : "Enter your email and we'll send a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email address</Label>
                <Input id="reset-email" type="email" placeholder="you@example.com" {...register('email')}
                  className={errors.email ? 'border-destructive' : ''} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <Button id="btn-reset" type="submit" className="w-full" disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.53 0.28 272))' }}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : 'Send reset link'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Reset link sent! Check your inbox.</p>
            </div>
          )}
          <Link href="/auth/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

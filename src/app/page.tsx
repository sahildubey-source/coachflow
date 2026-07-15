'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Users, BarChart3, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-primary selection:text-primary-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">CoachFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button className="bg-white text-slate-950 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-32">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Now available in public beta
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight"
            >
              The intelligent OS for your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                coaching business
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Manage students, track attendance, process fees, and analyze academic performance all in one beautifully designed, unified platform.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 border-0">
                  Start your free trial
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm">
                  See how it works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-950 relative border-t border-white/5">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Say goodbye to scattered spreadsheets and messy WhatsApp groups. CoachFlow brings your entire institute under one roof.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-indigo-400" />}
              title="Student Management"
              description="Seamlessly track enrollments across multiple batches. Maintain detailed profiles for every student."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-purple-400" />}
              title="Academics & Tests"
              description="Schedule tests, record marks instantly with our spreadsheet-view, and track performance over time."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
              title="Automated Finances"
              description="Define fee structures, record transactions, and let the dashboard calculate your revenue automatically."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500">
        <p>© {new Date().getFullYear()} CoachFlow. Built for visionary educators.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-slate-200">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { GraduationCap, LayoutDashboard, CalendarCheck, ClipboardList, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/student', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
  { href: '/student/tests', label: 'My Test Results', icon: ClipboardList },
  { href: '/student/fees', label: 'My Fees', icon: IndianRupee },
]

interface StudentSidebarProps {
  studentName?: string
}

export default function StudentSidebar({ studentName }: StudentSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full border-r border-border/50 overflow-hidden"
      style={{ background: 'var(--sidebar)' }}
    >
      {/* Header */}
      <div className={cn('flex items-center h-16 px-4 border-b border-border/50 shrink-0', collapsed ? 'justify-center' : 'gap-3')}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.63 0.22 274))' }}
        >
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <p className="text-sm font-bold text-foreground leading-tight">CoachFlow</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">Student Portal</p>
          </motion.div>
        )}
      </div>

      {/* Student badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-semibold truncate">{studentName ?? 'Student'}</p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/student' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-0 w-11 mx-auto')}
            >
              <Icon style={{ width: 18, height: 18 }} className="shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10 text-muted-foreground hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  DollarSign,
  ClipboardList,
  UserPlus,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['coaching_owner', 'teacher'] },
  { href: '/dashboard/students', label: 'Students', icon: Users, roles: ['coaching_owner', 'teacher'] },
  { href: '/dashboard/teachers', label: 'Teachers', icon: BookOpen, roles: ['coaching_owner'] },
  { href: '/dashboard/batches', label: 'Batches', icon: GraduationCap, roles: ['coaching_owner', 'teacher'] },
  { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['coaching_owner', 'teacher'] },
  { href: '/dashboard/fees', label: 'Fees', icon: DollarSign, roles: ['coaching_owner', 'teacher'] },
  { href: '/dashboard/tests', label: 'Tests', icon: ClipboardList, roles: ['coaching_owner', 'teacher'] },
  { href: '/dashboard/crm', label: 'CRM / Leads', icon: UserPlus, badge: 'New', roles: ['coaching_owner'] },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, roles: ['coaching_owner', 'teacher'] },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, roles: ['coaching_owner', 'teacher'] },
]

const bottomItems = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['coaching_owner'] },
]

interface SidebarProps {
  coachingName?: string
  userRole?: string
}

export default function Sidebar({ coachingName, userRole = 'coaching_owner' }: SidebarProps) {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-sm font-bold text-foreground leading-tight">CoachFlow</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
              {coachingName ?? 'My Institute'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.filter(item => !item.roles || item.roles.includes(userRole)).map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Tooltip key={href} delayDuration={collapsed ? 100 : 999999}>
              <TooltipTrigger
                render={
                  <Link
                    href={href}
                    id={`nav-${label.toLowerCase().replace(/[^a-z]/g, '-')}`}
                    className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-0 w-11 mx-auto')}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                    {!collapsed && (
                      <span className="flex-1 truncate">{label}</span>
                    )}
                    {!collapsed && badge && (
                      <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5 font-semibold"
                        style={{ background: 'oklch(0.77 0.19 75 / 0.15)', color: 'oklch(0.55 0.17 70)' }}>
                        {badge}
                      </Badge>
                    )}
                  </Link>
                }
              />
              {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
            </Tooltip>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="px-2 pb-3 space-y-0.5 border-t border-border/50 pt-3">
        {bottomItems.filter(item => !item.roles || item.roles.includes(userRole)).map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Tooltip key={href} delayDuration={collapsed ? 100 : 999999}>
              <TooltipTrigger
                render={
                  <Link
                    href={href}
                    id={`nav-${label.toLowerCase()}`}
                    className={cn('nav-item', isActive && 'active', collapsed && 'justify-center px-0 w-11 mx-auto')}
                  >
                    <Icon style={{ width: 18, height: 18 }} className="shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{label}</span>}
                  </Link>
                }
              />
              {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
            </Tooltip>
          )
        })}
      </div>

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

'use client'

import { LogOut, Sun, Moon, GraduationCap } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface StudentTopBarProps {
  studentName?: string
}

export default function StudentTopBar({ studentName }: StudentTopBarProps) {
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = studentName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'ST'

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
      {/* Branding for student portal */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
          <GraduationCap className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-primary">Student Portal</span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="text-muted-foreground hover:text-foreground"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs font-semibold" style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.63 0.22 274))', color: 'white' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-tight">{studentName ?? 'Student'}</p>
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

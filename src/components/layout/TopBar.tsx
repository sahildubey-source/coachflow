'use client'

import { Bell, Search, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TopBar() {
  const { profile, coaching, signOut } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const router = useRouter()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students, batches, fees..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/60 rounded-lg border border-transparent focus:outline-none focus:border-primary/30 focus:bg-background transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          id="btn-toggle-dark"
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button
          id="btn-notifications"
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="w-4 h-4" />
          <Badge
            className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center p-0 text-[9px]"
            style={{ background: 'oklch(0.53 0.28 272)', color: 'white' }}
          >
            3
          </Badge>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
              id="btn-user-menu"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors outline-none"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback
                  className="text-xs font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, oklch(0.46 0.27 268), oklch(0.63 0.22 274))' }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-tight truncate max-w-[120px]">
                  {profile?.full_name ?? 'Loading...'}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {coaching?.name ?? 'My Institute'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2.5 py-2 border-b border-border/50">
              <p className="text-sm font-medium leading-none mb-1">{profile?.full_name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground font-normal truncate">{profile?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem id="menu-profile">
              <User className="w-4 h-4 mr-2" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              id="menu-signout"
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

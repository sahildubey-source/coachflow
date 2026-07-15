import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import QueryProvider from '@/components/providers/QueryProvider'

export const metadata: Metadata = {
  title: {
    default: 'CoachFlow — Coaching Institute Management',
    template: '%s | CoachFlow',
  },
  description: 'The complete management platform for coaching institutes. Manage students, attendance, fees, tests, and more.',
  keywords: ['coaching institute software', 'student management', 'attendance management', 'fee management', 'CRM for coaching'],
  authors: [{ name: 'CoachFlow' }],
  openGraph: {
    title: 'CoachFlow',
    description: 'The complete management platform for coaching institutes.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

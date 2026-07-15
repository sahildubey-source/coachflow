export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-gradient min-h-screen flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, oklch(0.63 0.22 274) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, oklch(0.77 0.19 75) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

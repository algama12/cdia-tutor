import { Sidebar } from '@/components/layout/Sidebar'

interface AppShellProps {
  children: React.ReactNode
  userFullName: string | null
  userEmail: string | null
}

export function AppShell({ children, userFullName, userEmail }: AppShellProps) {
  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden lg:flex">
        <Sidebar userFullName={userFullName} userEmail={userEmail} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  )
}

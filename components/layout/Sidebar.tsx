'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { BookOpen, BarChart3, Sun, LogOut } from 'lucide-react'
import { logout } from '@/app/actions'

interface SidebarProps {
  userFullName: string | null
  userEmail: string | null
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: BookOpen },
  { href: '/progress', label: 'Progreso', icon: BarChart3 },
  { href: '/onboarding', label: 'Summer Mode', icon: Sun },
]

export function Sidebar({ userFullName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await logout()
    })
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-base">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle">
          <span className="select-none text-sm font-bold text-primary">C</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-text">CDIA Tutor</p>
          <p className="text-xs text-text-faint">UGR · 1º curso</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-4" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150',
                isActive
                  ? 'border-l-2 border-primary bg-surface text-text'
                  : 'text-text-muted hover:bg-surface hover:text-text',
              ].join(' ')}
            >
              <Icon className="size-[18px]" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-border px-3 py-4">
        <div className="mb-2 px-1">
          <p className="truncate text-sm font-medium text-text">{userFullName ?? 'Usuario'}</p>
          <p className="truncate text-xs text-text-faint">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted transition-colors duration-150 hover:bg-surface hover:text-text disabled:opacity-40"
        >
          <LogOut className="size-[18px]" aria-hidden="true" />
          {isPending ? 'Saliendo…' : 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  )
}

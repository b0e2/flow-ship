import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Header } from './Header'

type AppShellProps = {
  children: ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Header />
      <main
        className={cn(
          'w-full px-3 py-2',
          className,
        )}
      >
        {children}
      </main>
    </div>
  )
}

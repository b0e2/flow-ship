import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Header } from './Header'

type AppShellProps = {
  children: ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />
      <main
        className={cn(
          'mx-auto w-full max-w-[1920px] px-4 py-4 lg:px-5',
          className,
        )}
      >
        {children}
      </main>
    </div>
  )
}

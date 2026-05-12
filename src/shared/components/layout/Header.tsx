import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../../features/theme/store/themeStore'
import { UserMenu } from '../../../features/auth/components/UserMenu'

export function Header() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <header className="border-b border-white/10 bg-slate-950">
      <div className="flex w-full flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
            <span className="text-sm font-black text-white">F</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">
              FlowShip-시연-aws

            </p>
            <p className="text-[11px] font-medium text-slate-400">
              Deployment Control Center
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/8 text-slate-300 transition hover:bg-white/20 hover:text-white"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'dark' ? (
              <Sun aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Moon aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

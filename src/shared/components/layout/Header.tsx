import { UserMenu } from '../../../features/auth/components/UserMenu'

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-5">
        <div>
          <p className="text-lg font-semibold tracking-tight text-slate-950">
            FlowShip
          </p>
          <p className="text-xs font-medium text-slate-500">
            Deployment Control Center
          </p>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}

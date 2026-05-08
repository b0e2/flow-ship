export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            FlowShip
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Frontend CI/CD Observability Dashboard
          </p>
        </div>
      </div>
    </header>
  )
}

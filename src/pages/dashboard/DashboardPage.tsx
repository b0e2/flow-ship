import { AppShell } from '../../shared/components/layout/AppShell'

const featureCards = [
  {
    title: 'Deployment Status',
    description:
      '배포 상태를 빠르게 식별하고 릴리스 흐름의 현재 위치를 확인합니다.',
  },
  {
    title: 'Pipeline Flow',
    description:
      'GitHub Actions 워크플로우의 진행 흐름을 명확한 단계로 추적합니다.',
  },
  {
    title: 'Failure Insights',
    description:
      '실패 징후와 안정성 신호를 한 화면에서 탐색할 수 있도록 준비합니다.',
  },
] as const

export function DashboardPage() {
  return (
    <AppShell>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              FlowShip
            </h1>
            <p className="max-w-2xl text-xl font-medium text-slate-700">
              Ship faster with visible deployment flow.
            </p>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              GitHub Actions 기반 배포 파이프라인의 상태와 안정성을 한눈에
              확인하는 대시보드입니다.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Frontend CI/CD
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Observability overview
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Ready
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="h-3 w-3/4 rounded-full bg-slate-200" />
            <div className="h-3 w-full rounded-full bg-slate-100" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="h-20 rounded-2xl bg-sky-50" />
              <div className="h-20 rounded-2xl bg-indigo-50" />
              <div className="h-20 rounded-2xl bg-rose-50" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {featureCards.map((card) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            key={card.title}
          >
            <h2 className="text-lg font-semibold text-slate-950">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {card.description}
            </p>
          </article>
        ))}
      </section>
    </AppShell>
  )
}

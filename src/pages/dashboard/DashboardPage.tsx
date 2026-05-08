import { useState } from 'react'
import { AppShell } from '../../shared/components/layout/AppShell'
import { RepositoryConnectionSummary } from '../../features/repository/components/RepositoryConnectionSummary'
import { RepositorySetupPanel } from '../../features/repository/components/RepositorySetupPanel'
import { useRepositoryConfigStore } from '../../features/repository/store/repositoryConfigStore'

export function DashboardPage() {
  const config = useRepositoryConfigStore((state) => state.config)
  const [isEditingConfig, setIsEditingConfig] = useState(false)
  const shouldShowSetup = !config || isEditingConfig

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              FlowShip
            </h1>
            <p className="mt-4 max-w-2xl text-xl font-medium text-slate-700">
              Ship faster with visible deployment flow.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              GitHub Actions 기반 배포 파이프라인의 상태와 안정성을 한눈에
              확인하는 대시보드입니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Observability scope
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Actions · S3 · Amplify · Vite
            </p>
          </div>
        </section>

        {shouldShowSetup ? (
          <RepositorySetupPanel
            initialConfig={config}
            onSaved={() => setIsEditingConfig(false)}
          />
        ) : (
          <RepositoryConnectionSummary
            config={config}
            onChangeRepository={() => setIsEditingConfig(true)}
          />
        )}

        {config && !shouldShowSetup ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ready for real workflow data
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Repository connected. Workflow runs are not rendered in this step
              yet.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              FlowShip will only show data returned by the GitHub Actions API.
              Until workflow run UI is implemented, no fake pipeline or
              deployment history is displayed.
            </p>
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}

import { AppShell } from '../../shared/components/layout/AppShell'
import { DashboardFilters } from '../../features/deployments/components/DashboardFilters'
import { DeploymentCharts } from '../../features/deployments/components/DeploymentCharts'
import { DeploymentChecklist } from '../../features/deployments/components/DeploymentChecklist'
import { DeploymentPipeline } from '../../features/deployments/components/DeploymentPipeline'
import { DeploymentTable } from '../../features/deployments/components/DeploymentTable'
import { EnvironmentStatus } from '../../features/deployments/components/EnvironmentStatus'
import { FailureLogs } from '../../features/deployments/components/FailureLogs'
import { ReleaseNotes } from '../../features/deployments/components/ReleaseNotes'
import { SummaryCards } from '../../features/deployments/components/SummaryCards'
import { useDeployments } from '../../features/deployments/hooks/useDeployments'

export function DashboardPage() {
  const { data, isLoading, isError } = useDeployments()

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

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-600 shadow-sm">
            Loading deployment telemetry...
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center text-sm font-semibold text-rose-700 shadow-sm">
            Failed to load deployment telemetry.
          </div>
        ) : null}

        {data ? (
          <>
            <DashboardFilters deployments={data.deployments} />
            <SummaryCards deployments={data.deployments} />
            <DeploymentCharts deployments={data.deployments} />
            <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
              <DeploymentPipeline steps={data.pipelineSteps} />
              <EnvironmentStatus environments={data.environments} />
            </section>
            <DeploymentTable deployments={data.deployments} />
            <section className="grid gap-4 xl:grid-cols-3">
              <FailureLogs failureLogs={data.failureLogs} />
              <DeploymentChecklist />
              <ReleaseNotes releaseNotes={data.releaseNotes} />
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  )
}

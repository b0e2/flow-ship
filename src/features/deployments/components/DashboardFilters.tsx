import type {
  Deployment,
  DeploymentEnvironment,
  DeploymentStatus,
} from '../model/deployment.types'
import { useDeploymentFilterStore } from '../store/deploymentFilterStore'

type DashboardFiltersProps = {
  deployments: Deployment[]
}

const environments: Array<'all' | DeploymentEnvironment> = [
  'all',
  'production',
  'staging',
  'development',
]

const statuses: Array<'all' | DeploymentStatus> = [
  'all',
  'success',
  'failed',
  'running',
  'canceled',
]

export function DashboardFilters({ deployments }: DashboardFiltersProps) {
  const {
    branch,
    environment,
    status,
    setBranch,
    setEnvironment,
    setStatus,
    resetFilters,
  } = useDeploymentFilterStore()

  const branches = [
    'all',
    ...new Set(deployments.map((deployment) => deployment.branch)),
  ]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Branch
          </span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            onChange={(event) => setBranch(event.target.value)}
            value={branch}
          >
            {branches.map((branchOption) => (
              <option key={branchOption} value={branchOption}>
                {branchOption}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Environment
          </span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            onChange={(event) =>
              setEnvironment(
                event.target.value as 'all' | DeploymentEnvironment,
              )
            }
            value={environment}
          >
            {environments.map((environmentOption) => (
              <option key={environmentOption} value={environmentOption}>
                {environmentOption}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </span>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            onChange={(event) =>
              setStatus(event.target.value as 'all' | DeploymentStatus)
            }
            value={status}
          >
            {statuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {statusOption}
              </option>
            ))}
          </select>
        </label>

        <button
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          onClick={resetFilters}
          type="button"
        >
          Reset filters
        </button>
      </div>
    </section>
  )
}

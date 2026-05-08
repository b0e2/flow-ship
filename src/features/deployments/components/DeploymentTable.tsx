import type {
  Deployment,
  DeploymentEnvironment,
  DeploymentStatus,
} from '../model/deployment.types'
import { useDeploymentFilterStore } from '../store/deploymentFilterStore'
import { filterDeployments, formatDuration } from '../utils/deploymentUtils'

type DeploymentTableProps = {
  deployments: Deployment[]
}

const statusStyles: Record<DeploymentStatus, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
  running: 'bg-amber-50 text-amber-700 ring-amber-200',
  canceled: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const environmentStyles: Record<DeploymentEnvironment, string> = {
  production: 'bg-blue-50 text-blue-700 ring-blue-200',
  staging: 'bg-violet-50 text-violet-700 ring-violet-200',
  development: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function DeploymentTable({ deployments }: DeploymentTableProps) {
  const filters = useDeploymentFilterStore()
  const filteredDeployments = filterDeployments(deployments, filters)

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Recent deployment history
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Filtered by branch, environment, and deployment status.
        </p>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            No deployments match the selected filters.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Reset filters or choose a different branch, environment, or status.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Version</th>
                <th className="px-5 py-3 font-semibold">Branch</th>
                <th className="px-5 py-3 font-semibold">Commit</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Environment</th>
                <th className="px-5 py-3 font-semibold">Duration</th>
                <th className="px-5 py-3 font-semibold">Author</th>
                <th className="px-5 py-3 font-semibold">Deployed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeployments.map((deployment) => (
                <tr
                  className="transition hover:bg-slate-50"
                  key={deployment.id}
                >
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">
                    {deployment.version}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {deployment.branch}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500">
                    {deployment.commitHash.slice(0, 7)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[deployment.status]}`}
                    >
                      {deployment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${environmentStyles[deployment.environment]}`}
                    >
                      {deployment.environment}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {formatDuration(deployment.durationSeconds)}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                    {deployment.author}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                    {formatDate(deployment.deployedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}

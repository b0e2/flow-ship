import type {
  DeploymentEnvironment,
  EnvironmentHealth,
} from '../model/deployment.types'

type EnvironmentStatusProps = {
  environments: EnvironmentHealth[]
}

const environmentLabels: Record<DeploymentEnvironment, string> = {
  production: 'Production',
  staging: 'Staging',
  development: 'Development',
}

const healthStyles = {
  healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  deploying: 'bg-sky-50 text-sky-700 border-sky-200',
} satisfies Record<EnvironmentHealth['status'], string>

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function EnvironmentStatus({ environments }: EnvironmentStatusProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Environment status
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Current release health by deployment target.
        </p>
      </div>

      <div className="grid gap-3">
        {environments.map((environment) => (
          <div
            className="rounded-2xl border border-slate-200 p-4"
            key={environment.id}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">
                  {environmentLabels[environment.environment]}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {environment.version} · {environment.uptime.toFixed(2)}%
                  uptime
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthStyles[environment.status]}`}
              >
                {environment.status}
              </span>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Last deployed {formatDate(environment.lastDeployedAt)}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}

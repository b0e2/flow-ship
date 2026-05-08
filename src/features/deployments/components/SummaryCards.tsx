import {
  Activity,
  Clock3,
  GitBranch,
  PackageCheck,
  Rocket,
  ShieldAlert,
} from 'lucide-react'
import type { Deployment } from '../model/deployment.types'
import {
  formatDuration,
  getAverageDeploymentDuration,
  getDeploymentSuccessRate,
  getLatestProductionVersion,
  getRecentFailureCount,
  getRunningDeploymentCount,
} from '../utils/deploymentUtils'

type SummaryCardsProps = {
  deployments: Deployment[]
}

export function SummaryCards({ deployments }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total deployments',
      value: deployments.length.toString(),
      icon: Rocket,
      tone: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'Success rate',
      value: `${getDeploymentSuccessRate(deployments)}%`,
      icon: PackageCheck,
      tone: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Average duration',
      value: formatDuration(getAverageDeploymentDuration(deployments)),
      icon: Clock3,
      tone: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Recent failures',
      value: getRecentFailureCount(deployments).toString(),
      icon: ShieldAlert,
      tone: 'text-rose-600 bg-rose-50',
    },
    {
      label: 'Running now',
      value: getRunningDeploymentCount(deployments).toString(),
      icon: Activity,
      tone: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Production version',
      value: getLatestProductionVersion(deployments),
      icon: GitBranch,
      tone: 'text-slate-700 bg-slate-100',
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            key={card.label}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {card.value}
                </p>
              </div>
              <span className={`rounded-2xl p-3 ${card.tone}`}>
                <Icon aria-hidden="true" size={20} />
              </span>
            </div>
          </article>
        )
      })}
    </section>
  )
}

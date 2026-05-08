import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Deployment } from '../model/deployment.types'
import {
  getDeploymentCountByEnvironment,
  getDeploymentStatusTrend,
} from '../utils/deploymentUtils'

type DeploymentChartsProps = {
  deployments: Deployment[]
}

export function DeploymentCharts({ deployments }: DeploymentChartsProps) {
  const statusTrend = getDeploymentStatusTrend(deployments)
  const environmentCounts = getDeploymentCountByEnvironment(deployments)

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Deployment status trend
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Daily status volume from recent GitHub Actions runs.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={statusTrend}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Line dataKey="success" stroke="#059669" strokeWidth={2} />
              <Line dataKey="failed" stroke="#e11d48" strokeWidth={2} />
              <Line dataKey="running" stroke="#d97706" strokeWidth={2} />
              <Line dataKey="canceled" stroke="#64748b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Deployments by environment
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Production, staging, and development distribution.
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={environmentCounts}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="environment"
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  )
}

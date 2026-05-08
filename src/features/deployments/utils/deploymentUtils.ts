import type {
  Deployment,
  DeploymentEnvironment,
  DeploymentStatus,
} from '../model/deployment.types'

type DeploymentFilters = {
  branch: 'all' | string
  environment: 'all' | DeploymentEnvironment
  status: 'all' | DeploymentStatus
}

export function getDeploymentSuccessRate(deployments: Deployment[]) {
  if (deployments.length === 0) {
    return 0
  }

  const successCount = deployments.filter(
    (deployment) => deployment.status === 'success',
  ).length

  return Math.round((successCount / deployments.length) * 100)
}

export function getAverageDeploymentDuration(deployments: Deployment[]) {
  if (deployments.length === 0) {
    return 0
  }

  const totalDuration = deployments.reduce(
    (sum, deployment) => sum + deployment.durationSeconds,
    0,
  )

  return Math.round(totalDuration / deployments.length)
}

export function getRecentFailureCount(deployments: Deployment[]) {
  return deployments.filter((deployment) => deployment.status === 'failed')
    .length
}

export function getRunningDeploymentCount(deployments: Deployment[]) {
  return deployments.filter((deployment) => deployment.status === 'running')
    .length
}

export function filterDeployments(
  deployments: Deployment[],
  filters: DeploymentFilters,
) {
  return deployments.filter((deployment) => {
    const matchesBranch =
      filters.branch === 'all' || deployment.branch === filters.branch
    const matchesEnvironment =
      filters.environment === 'all' ||
      deployment.environment === filters.environment
    const matchesStatus =
      filters.status === 'all' || deployment.status === filters.status

    return matchesBranch && matchesEnvironment && matchesStatus
  })
}

export function formatDuration(durationSeconds: number) {
  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds % 60

  if (minutes === 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${seconds}s`
}

export function getLatestProductionVersion(deployments: Deployment[]) {
  const latestProductionDeployment = deployments
    .filter(
      (deployment) =>
        deployment.environment === 'production' &&
        deployment.status === 'success',
    )
    .toSorted(
      (left, right) =>
        new Date(right.deployedAt).getTime() -
        new Date(left.deployedAt).getTime(),
    )[0]

  return latestProductionDeployment?.version ?? 'N/A'
}

export function getDeploymentCountByEnvironment(deployments: Deployment[]) {
  const environments: DeploymentEnvironment[] = [
    'production',
    'staging',
    'development',
  ]

  return environments.map((environment) => ({
    environment,
    count: deployments.filter(
      (deployment) => deployment.environment === environment,
    ).length,
  }))
}

export function getDeploymentStatusTrend(deployments: Deployment[]) {
  const groupedDeployments = deployments.reduce<Record<string, Deployment[]>>(
    (groups, deployment) => {
      const date = new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
      }).format(new Date(deployment.deployedAt))

      return {
        ...groups,
        [date]: [...(groups[date] ?? []), deployment],
      }
    },
    {},
  )

  return Object.entries(groupedDeployments)
    .map(([date, deploymentsForDate]) => ({
      date,
      success: deploymentsForDate.filter(
        (deployment) => deployment.status === 'success',
      ).length,
      failed: deploymentsForDate.filter(
        (deployment) => deployment.status === 'failed',
      ).length,
      running: deploymentsForDate.filter(
        (deployment) => deployment.status === 'running',
      ).length,
      canceled: deploymentsForDate.filter(
        (deployment) => deployment.status === 'canceled',
      ).length,
    }))
    .toSorted(
      (left, right) =>
        new Date(`${left.date}, 2026`).getTime() -
        new Date(`${right.date}, 2026`).getTime(),
    )
}

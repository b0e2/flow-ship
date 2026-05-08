import { mockDeploymentDashboardData } from '../data/mockDeployments'
import type { DeploymentDashboardData } from '../model/deployment.types'

export async function getDeployments(): Promise<DeploymentDashboardData> {
  await new Promise((resolve) => window.setTimeout(resolve, 300))

  return mockDeploymentDashboardData
}

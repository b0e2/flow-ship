import { useQuery } from '@tanstack/react-query'
import type { RepositoryConfig } from '../../repository/model/repository.types'
import { getWorkflowRuns } from '../api/githubActionsApi'
import {
  findLatestRun,
  isRunningWorkflowStatus,
} from '../utils/githubActionsUtils'

export function useWorkflowRuns(config: RepositoryConfig | null) {
  return useQuery({
    queryKey: ['github-actions', 'workflow-runs', config],
    queryFn: () => {
      if (!config) {
        throw new Error('Repository config is required.')
      }

      return getWorkflowRuns(config)
    },
    enabled: Boolean(config),
    refetchInterval: (query) => {
      const latestRun = findLatestRun(query.state.data?.workflow_runs ?? [])

      return latestRun && isRunningWorkflowStatus(latestRun.status)
        ? 1000 * 5
        : false
    },
  })
}

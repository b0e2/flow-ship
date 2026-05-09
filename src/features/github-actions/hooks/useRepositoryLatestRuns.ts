import { useQueries } from '@tanstack/react-query'
import type { RepositoryConfig } from '../../repository/model/repository.types'
import { getWorkflowRuns } from '../api/githubActionsApi'
import type { GitHubApiError, WorkflowRun } from '../model/githubActions.types'
import {
  findLatestRun,
  isRunningWorkflowStatus,
} from '../utils/githubActionsUtils'

export type RepositoryLatestRunState = {
  repository: RepositoryConfig
  latestRun: WorkflowRun | null
  isLoading: boolean
  isError: boolean
  error: GitHubApiError | Error | null
  dataUpdatedAt: number
}

export function useRepositoryLatestRuns(repositories: RepositoryConfig[]) {
  const results = useQueries({
    queries: repositories.map((repository) => ({
      queryKey: ['github-actions', 'latest-workflow-run', repository],
      queryFn: () => getWorkflowRuns(repository, 1),
      enabled: repositories.length > 0,
      refetchInterval: (query: {
        state: { data?: { workflow_runs: WorkflowRun[] } }
      }) => {
        const latestRun = findLatestRun(query.state.data?.workflow_runs ?? [])

        return latestRun && isRunningWorkflowStatus(latestRun.status)
          ? 1000 * 5
          : false
      },
    })),
  })

  return repositories.map<RepositoryLatestRunState>((repository, index) => {
    const result = results[index]

    return {
      repository,
      latestRun: result?.data ? findLatestRun(result.data.workflow_runs) : null,
      isLoading: result?.isLoading ?? false,
      isError: result?.isError ?? false,
      error: result?.error ?? null,
      dataUpdatedAt: result?.dataUpdatedAt ?? 0,
    }
  })
}

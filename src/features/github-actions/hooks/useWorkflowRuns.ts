import { useQuery } from '@tanstack/react-query'
import type { RepositoryConfig } from '../../repository/model/repository.types'
import { getWorkflowRuns } from '../api/githubActionsApi'

export function useWorkflowRuns(config: RepositoryConfig | null) {
  return useQuery({
    queryKey: ['github-actions', 'workflow-runs', config],
    queryFn: () => getWorkflowRuns(config as RepositoryConfig),
    enabled: Boolean(config),
  })
}

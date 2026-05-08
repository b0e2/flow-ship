import { useQuery } from '@tanstack/react-query'
import type { RepositoryConfig } from '../../repository/model/repository.types'
import { getWorkflowJobs } from '../api/githubActionsApi'

export function useWorkflowJobs(
  config: RepositoryConfig | null,
  runId: number | null,
) {
  return useQuery({
    queryKey: ['github-actions', 'workflow-jobs', config, runId],
    queryFn: () => getWorkflowJobs(config as RepositoryConfig, runId as number),
    enabled: Boolean(config) && runId !== null,
  })
}

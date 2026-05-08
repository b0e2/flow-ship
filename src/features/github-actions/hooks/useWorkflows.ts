import { useQuery } from '@tanstack/react-query'
import type { RepositoryConfig } from '../../repository/model/repository.types'
import { getWorkflows } from '../api/githubActionsApi'

export function useWorkflows(config: RepositoryConfig | null) {
  return useQuery({
    queryKey: ['github-actions', 'workflows', config],
    queryFn: () => getWorkflows(config as RepositoryConfig),
    enabled: Boolean(config),
  })
}

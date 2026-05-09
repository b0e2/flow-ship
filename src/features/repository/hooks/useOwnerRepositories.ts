import { useQuery } from '@tanstack/react-query'
import { listGitHubRepositories } from '../api/githubRepositoryApi'

type UseOwnerRepositoriesOptions = {
  owner: string
  token?: string
  enabled?: boolean
}

export function useOwnerRepositories({
  enabled = false,
  owner,
  token,
}: UseOwnerRepositoriesOptions) {
  return useQuery({
    queryKey: ['github-repositories', owner.trim(), token ? 'token' : 'public'],
    queryFn: () => listGitHubRepositories({ owner, token }),
    enabled: enabled && Boolean(owner.trim() || token?.trim()),
  })
}

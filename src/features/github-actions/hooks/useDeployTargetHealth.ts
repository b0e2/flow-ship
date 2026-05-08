import { useQuery } from '@tanstack/react-query'
import type { RepositoryConfig } from '../../repository/model/repository.types'
import { getDeployTargetHealth } from '../api/deployTargetHealthApi'

export function useDeployTargetHealth(config: RepositoryConfig | null) {
  return useQuery({
    queryKey: [
      'deploy-target-health',
      config?.s3WebsiteUrl ?? null,
      config?.amplifyUrl ?? null,
    ],
    queryFn: () =>
      getDeployTargetHealth({
        s3WebsiteUrl: config?.s3WebsiteUrl,
        amplifyUrl: config?.amplifyUrl,
      }),
    enabled: Boolean(config?.s3WebsiteUrl || config?.amplifyUrl),
    retry: 0,
  })
}

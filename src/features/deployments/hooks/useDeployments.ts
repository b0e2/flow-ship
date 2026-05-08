import { useQuery } from '@tanstack/react-query'
import { getDeployments } from '../api/getDeployments'

export function useDeployments() {
  return useQuery({
    queryKey: ['deployments'],
    queryFn: getDeployments,
  })
}

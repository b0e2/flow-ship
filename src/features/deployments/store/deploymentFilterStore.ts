import { create } from 'zustand'
import type {
  DeploymentEnvironment,
  DeploymentStatus,
} from '../model/deployment.types'

export type DeploymentFilterState = {
  branch: 'all' | string
  environment: 'all' | DeploymentEnvironment
  status: 'all' | DeploymentStatus
  setBranch: (branch: 'all' | string) => void
  setEnvironment: (environment: 'all' | DeploymentEnvironment) => void
  setStatus: (status: 'all' | DeploymentStatus) => void
  resetFilters: () => void
}

export const useDeploymentFilterStore = create<DeploymentFilterState>(
  (set) => ({
    branch: 'all',
    environment: 'all',
    status: 'all',
    setBranch: (branch) => set({ branch }),
    setEnvironment: (environment) => set({ environment }),
    setStatus: (status) => set({ status }),
    resetFilters: () =>
      set({
        branch: 'all',
        environment: 'all',
        status: 'all',
      }),
  }),
)

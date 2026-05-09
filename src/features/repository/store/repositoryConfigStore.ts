import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepositoryConfig } from '../model/repository.types'

type RepositoryConfigState = {
  config: RepositoryConfig | null
  hasHydrated: boolean
  setConfig: (config: RepositoryConfig) => void
  setHasHydrated: (hasHydrated: boolean) => void
  updateConfig: (partial: Partial<RepositoryConfig>) => void
  clearConfig: () => void
}

export const useRepositoryConfigStore = create<RepositoryConfigState>()(
  persist(
    (set) => ({
      config: null,
      hasHydrated: false,
      setConfig: (config) => set({ config }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      updateConfig: (partial) =>
        set((state) => ({
          config: state.config ? { ...state.config, ...partial } : null,
        })),
      clearConfig: () => set({ config: null }),
    }),
    {
      name: 'flow-ship-repository-config',
      partialize: (state) => ({ config: state.config }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

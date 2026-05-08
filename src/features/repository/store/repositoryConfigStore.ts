import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepositoryConfig } from '../model/repository.types'

type RepositoryConfigState = {
  config: RepositoryConfig | null
  setConfig: (config: RepositoryConfig) => void
  updateConfig: (partial: Partial<RepositoryConfig>) => void
  clearConfig: () => void
}

export const useRepositoryConfigStore = create<RepositoryConfigState>()(
  persist(
    (set) => ({
      config: null,
      setConfig: (config) => set({ config }),
      updateConfig: (partial) =>
        set((state) => ({
          config: state.config ? { ...state.config, ...partial } : null,
        })),
      clearConfig: () => set({ config: null }),
    }),
    {
      name: 'flow-ship-repository-config',
    },
  ),
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepositoryConfig } from '../model/repository.types'

type RepositoryConfigState = {
  repositories: RepositoryConfig[]
  activeRepositoryId: string | null
  hasHydrated: boolean
  addRepository: (repository: RepositoryConfig) => void
  updateRepository: (id: string, partial: Partial<RepositoryConfig>) => void
  removeRepository: (id: string) => void
  setActiveRepository: (id: string) => void
  clearRepositories: () => void
  getActiveRepository: () => RepositoryConfig | null
  setConfig: (config: RepositoryConfig) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useRepositoryConfigStore = create<RepositoryConfigState>()(
  persist(
    (set, get) => ({
      repositories: [],
      activeRepositoryId: null,
      hasHydrated: false,
      addRepository: (repository) =>
        set((state) => {
          const existingIndex = state.repositories.findIndex(
            (item) => item.id === repository.id,
          )
          const repositories =
            existingIndex >= 0
              ? state.repositories.map((item) =>
                  item.id === repository.id ? repository : item,
                )
              : [...state.repositories, repository]

          return {
            repositories,
            activeRepositoryId: repository.id,
          }
        }),
      updateRepository: (id, partial) =>
        set((state) => ({
          repositories: state.repositories.map((repository) =>
            repository.id === id
              ? { ...repository, ...partial, id }
              : repository,
          ),
        })),
      removeRepository: (id) =>
        set((state) => {
          const repositories = state.repositories.filter(
            (repository) => repository.id !== id,
          )
          const activeRepositoryId =
            state.activeRepositoryId === id
              ? (repositories[0]?.id ?? null)
              : state.activeRepositoryId

          return { repositories, activeRepositoryId }
        }),
      setActiveRepository: (id) => set({ activeRepositoryId: id }),
      clearRepositories: () =>
        set({ repositories: [], activeRepositoryId: null }),
      getActiveRepository: () => {
        const state = get()
        return (
          state.repositories.find(
            (repository) => repository.id === state.activeRepositoryId,
          ) ?? null
        )
      },
      setConfig: (config) =>
        set((state) => {
          const repositories = state.repositories.some(
            (repository) => repository.id === config.id,
          )
            ? state.repositories.map((repository) =>
                repository.id === config.id ? config : repository,
              )
            : [...state.repositories, config]

          return {
            repositories,
            activeRepositoryId: config.id,
          }
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'flow-ship-repository-config',
      version: 1,
      partialize: (state) => ({
        repositories: state.repositories,
        activeRepositoryId: state.activeRepositoryId,
      }),
      migrate: (persistedState: unknown) => {
        if (
          typeof persistedState !== 'object' ||
          persistedState === null ||
          !('config' in persistedState)
        ) {
          return persistedState
        }

        const legacyState = persistedState as {
          config?: Omit<RepositoryConfig, 'id' | 'name'> & {
            id?: string
            name?: string
          }
        }

        if (!legacyState.config) {
          return {
            repositories: [],
            activeRepositoryId: null,
          }
        }

        const repository = {
          ...legacyState.config,
          id:
            legacyState.config.id ??
            `${legacyState.config.owner}/${legacyState.config.repo}:${legacyState.config.branch}`,
          name: legacyState.config.name ?? legacyState.config.repo,
        }

        return {
          repositories: [repository],
          activeRepositoryId: repository.id,
        }
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

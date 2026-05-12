import { create } from 'zustand'
import type { RepositoryConfig } from '../model/repository.types'

type PersistedRepositoryState = {
  repositories: RepositoryConfig[]
  activeRepositoryId: string | null
}

type RepositoryConfigState = PersistedRepositoryState & {
  storageUserId: string | null
  hasHydrated: boolean
  setStorageUser: (userId: string | null) => void
  addRepository: (repository: RepositoryConfig) => void
  updateRepository: (id: string, partial: Partial<RepositoryConfig>) => void
  removeRepository: (id: string) => void
  setActiveRepository: (id: string) => void
  clearRepositories: () => void
  getActiveRepository: () => RepositoryConfig | null
  setConfig: (config: RepositoryConfig) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

function getUserStorageKey(userId: string) {
  return `flowship:repositories:${userId}`
}

function isRepositoryConfig(value: unknown): value is RepositoryConfig {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.owner === 'string' &&
    typeof record.repo === 'string' &&
    typeof record.branch === 'string'
  )
}

function isPersistedRepositoryState(
  value: unknown,
): value is PersistedRepositoryState {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    Array.isArray(record.repositories) &&
    record.repositories.every(isRepositoryConfig) &&
    (typeof record.activeRepositoryId === 'string' ||
      record.activeRepositoryId === null)
  )
}

function readUserState(userId: string): PersistedRepositoryState | null {
  const raw = localStorage.getItem(getUserStorageKey(userId))

  if (!raw) {
    return null
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  return isPersistedRepositoryState(parsed) ? parsed : null
}

function writeUserState(userId: string, state: PersistedRepositoryState) {
  localStorage.setItem(getUserStorageKey(userId), JSON.stringify(state))
}

function persistForCurrentUser(state: RepositoryConfigState) {
  if (!state.storageUserId) {
    return
  }

  writeUserState(state.storageUserId, {
    repositories: state.repositories,
    activeRepositoryId: state.activeRepositoryId,
  })
}

export function removeRepositoryConfigForUser(userId: string) {
  localStorage.removeItem(getUserStorageKey(userId))
}

export const useRepositoryConfigStore = create<RepositoryConfigState>()(
  (set, get) => ({
    repositories: [],
    activeRepositoryId: null,
    storageUserId: null,
    hasHydrated: false,
    setStorageUser: (userId) => {
      if (!userId) {
        set({
          repositories: [],
          activeRepositoryId: null,
          storageUserId: null,
          hasHydrated: true,
        })
        return
      }

      const savedState = readUserState(userId)

      set({
        repositories: savedState?.repositories ?? [],
        activeRepositoryId: savedState?.activeRepositoryId ?? null,
        storageUserId: userId,
        hasHydrated: true,
      })
    },
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
        const nextState = {
          ...state,
          repositories,
          activeRepositoryId: repository.id,
        }

        persistForCurrentUser(nextState)

        return nextState
      }),
    updateRepository: (id, partial) =>
      set((state) => {
        const repositories = state.repositories.map((repository) =>
          repository.id === id ? { ...repository, ...partial, id } : repository,
        )
        const nextState = { ...state, repositories }

        persistForCurrentUser(nextState)

        return nextState
      }),
    removeRepository: (id) =>
      set((state) => {
        const repositories = state.repositories.filter(
          (repository) => repository.id !== id,
        )
        const activeRepositoryId =
          state.activeRepositoryId === id
            ? (repositories[0]?.id ?? null)
            : state.activeRepositoryId
        const nextState = { ...state, repositories, activeRepositoryId }

        persistForCurrentUser(nextState)

        return nextState
      }),
    setActiveRepository: (id) =>
      set((state) => {
        const nextState = { ...state, activeRepositoryId: id }

        persistForCurrentUser(nextState)

        return nextState
      }),
    clearRepositories: () =>
      set((state) => {
        const nextState = {
          ...state,
          repositories: [],
          activeRepositoryId: null,
        }

        persistForCurrentUser(nextState)

        return nextState
      }),
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
        const nextState = {
          ...state,
          repositories,
          activeRepositoryId: config.id,
        }

        persistForCurrentUser(nextState)

        return nextState
      }),
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
  }),
)

import { create } from 'zustand'

type GitHubActionsUiState = {
  selectedRunId: number | null
  setSelectedRunId: (runId: number) => void
  clearSelectedRunId: () => void
}

export const useGitHubActionsUiStore = create<GitHubActionsUiState>((set) => ({
  selectedRunId: null,
  setSelectedRunId: (runId) => set({ selectedRunId: runId }),
  clearSelectedRunId: () => set({ selectedRunId: null }),
}))

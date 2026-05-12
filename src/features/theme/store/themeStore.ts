import { create } from 'zustand'

type Theme = 'light' | 'dark'

type ThemeState = {
  theme: Theme
  toggleTheme: () => void
}

const STORAGE_KEY = 'flowship:theme'

function readPersistedTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // noop
  }
  return 'light'
}

function applyThemeToDocument(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // noop
  }
}

const initialTheme = readPersistedTheme()
applyThemeToDocument(initialTheme)

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'light' ? 'dark' : 'light'
      applyThemeToDocument(next)
      return { theme: next }
    }),
}))

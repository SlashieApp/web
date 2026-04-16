'use client'

import { ChakraProvider } from '@chakra-ui/react'
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { darkSystem, system as lightSystem } from '@/theme/system'

export type AppThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'slashie-theme'

function applyThemeMode(mode: AppThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = mode
  document.documentElement.style.colorScheme = mode
  try {
    window.localStorage?.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // ignore storage errors
  }
}

type AppThemeContextValue = {
  mode: AppThemeMode
  toggle: () => void
}

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined,
)

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext)
  if (!ctx) {
    throw new Error('useAppTheme must be used within <ThemeProvider>')
  }
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppThemeMode>(() => {
    if (typeof window === 'undefined') return 'light'

    const hintedMode = document.documentElement.dataset.theme
    if (hintedMode === 'light' || hintedMode === 'dark') {
      applyThemeMode(hintedMode)
      return hintedMode
    }

    const stored = window.localStorage?.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      applyThemeMode(stored)
      return stored
    }

    const prefersDark =
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    const resolved = prefersDark ? 'dark' : 'light'
    applyThemeMode(resolved)
    return resolved
  })

  const chakraSystem = mode === 'dark' ? darkSystem : lightSystem

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyThemeMode(next)
      return next
    })
  }, [])

  const themeContextValue = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      toggle,
    }),
    [mode, toggle],
  )

  return (
    <ChakraProvider value={chakraSystem}>
      <AppThemeContext.Provider value={themeContextValue}>
        {children}
      </AppThemeContext.Provider>
    </ChakraProvider>
  )
}

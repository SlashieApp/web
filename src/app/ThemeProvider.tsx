'use client'

import { ChakraProvider } from '@chakra-ui/react'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { darkSystem, system as lightSystem } from '@/theme/system'

export type AppThemeMode = 'light' | 'dark'

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
    const stored = window.localStorage?.getItem('slashie-theme')
    if (stored === 'light' || stored === 'dark') return stored
    const prefersDark =
      window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    return prefersDark ? 'dark' : 'light'
  })

  const chakraSystem = mode === 'dark' ? darkSystem : lightSystem

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = mode
    document.documentElement.style.colorScheme = mode
    try {
      window.localStorage?.setItem('slashie-theme', mode)
    } catch {
      // ignore storage errors
    }
  }, [mode])

  const themeContextValue = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      toggle: () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
      },
    }),
    [mode],
  )

  return (
    <ChakraProvider value={chakraSystem}>
      <AppThemeContext.Provider value={themeContextValue}>
        {children}
      </AppThemeContext.Provider>
    </ChakraProvider>
  )
}

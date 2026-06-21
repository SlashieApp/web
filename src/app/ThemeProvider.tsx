'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import type { ReactNode } from 'react'

import { darkSystem, system as lightSystem } from '@/theme/chakraSystem'
import { ColorModeProvider } from '@/ui/color-mode'

export type AppThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'slashie-theme'

// Dark mode is temporarily disabled: force light theme app-wide. The dark theme
// system and color-mode feature are kept intact so this can be re-enabled by
// removing `forcedTheme` and restoring `defaultTheme="system"` + `enableSystem`.
const FORCED_THEME: AppThemeMode = 'light'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const ThemeSystemProvider = ({ children }: { children: ReactNode }) => {
    const { forcedTheme, resolvedTheme } = useNextTheme()
    const colorMode = forcedTheme ?? resolvedTheme
    const mode: AppThemeMode = colorMode === 'dark' ? 'dark' : 'light'
    const activeSystem = mode === 'dark' ? darkSystem : lightSystem
    return <ChakraProvider value={activeSystem}>{children}</ChakraProvider>
  }

  return (
    <ColorModeProvider
      defaultTheme={FORCED_THEME}
      forcedTheme={FORCED_THEME}
      storageKey={THEME_STORAGE_KEY}
    >
      <ThemeSystemProvider>{children}</ThemeSystemProvider>
    </ColorModeProvider>
  )
}

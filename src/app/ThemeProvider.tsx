'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import type { ReactNode } from 'react'

import { darkSystem, system as lightSystem } from '@/theme/system'
import { ColorModeProvider } from '@/ui/color-mode'

export type AppThemeMode = 'light' | 'dark'
const THEME_STORAGE_KEY = 'slashie-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const ThemeSystemProvider = ({ children }: { children: ReactNode }) => {
    const { resolvedTheme } = useNextTheme()
    const mode: AppThemeMode = resolvedTheme === 'dark' ? 'dark' : 'light'
    const activeSystem = mode === 'dark' ? darkSystem : lightSystem
    return <ChakraProvider value={activeSystem}>{children}</ChakraProvider>
  }

  return (
    <ColorModeProvider
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
    >
      <ThemeSystemProvider>{children}</ThemeSystemProvider>
    </ColorModeProvider>
  )
}

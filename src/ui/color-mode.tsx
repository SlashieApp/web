'use client'

import type {
  IconButtonProps as ChakraIconButtonProps,
  SpanProps,
} from '@chakra-ui/react'
import { ClientOnly, Skeleton, Span } from '@chakra-ui/react'

import { IconButton } from '@ui'
import { ThemeProvider, useTheme } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'
import * as React from 'react'
import { LuMoon, LuSun } from 'react-icons/lu'

export interface ColorModeProviderProps extends ThemeProviderProps {}

const LIGHT_BASE_BG = '#f7f8f7'
const DARK_BASE_BG = '#222222'

function ColorModeBaseBgSync() {
  const { resolvedTheme, forcedTheme } = useTheme()
  const colorMode = forcedTheme || resolvedTheme
  const baseColor = colorMode === 'dark' ? DARK_BASE_BG : LIGHT_BASE_BG

  const applyBaseColorRef = React.useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || typeof document === 'undefined') return
      document.body.style.backgroundColor = baseColor
    },
    [baseColor],
  )

  return <span ref={applyBaseColorRef} hidden aria-hidden />
}

export function ColorModeProvider(props: ColorModeProviderProps) {
  const { children, ...rest } = props

  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...rest}>
      <ColorModeBaseBgSync />
      {children}
    </ThemeProvider>
  )
}

export type ColorMode = 'light' | 'dark'

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = forcedTheme || resolvedTheme
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }
  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps
  extends Omit<ChakraIconButtonProps, 'aria-label'> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="9" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: '5',
            height: '5',
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    )
  },
)

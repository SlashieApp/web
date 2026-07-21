'use client'

import { Box, Text } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { useColorMode } from '@/ui/color-mode'

import {
  TURNSTILE_SCRIPT_SRC,
  getTurnstileSiteKey,
  isTurnstileConfigured,
} from '../helpers/turnstileConfig'

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      theme?: 'light' | 'dark' | 'auto'
      callback?: (token: string) => void
      'expired-callback'?: () => void
      'error-callback'?: () => void
      'timeout-callback'?: () => void
    },
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type TurnstileFieldProps = {
  onTokenChange: (token: string | null) => void
  /** Change to force a fresh challenge (e.g. after API CAPTCHA rejection). */
  resetSignal?: number
  label?: string
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-slashie-turnstile]',
  )
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Turnstile script failed to load')),
        { once: true },
      )
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.dataset.slashieTurnstile = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile script failed to load'))
    document.head.appendChild(script)
  })
}

/**
 * Privacy-friendly Cloudflare Turnstile challenge for auth routes.
 * Loads the script only when mounted; no-ops when the site key is unset.
 */
export function TurnstileField({
  onTokenChange,
  resetSignal = 0,
  label = 'Security check',
}: TurnstileFieldProps) {
  const { colorMode } = useColorMode()
  const widgetIdRef = useRef<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const onTokenChangeRef = useRef(onTokenChange)
  onTokenChangeRef.current = onTokenChange
  const lastResetRef = useRef(resetSignal)
  const renderGenerationRef = useRef(0)

  const destroyWidget = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // Widget may already be gone.
      }
      widgetIdRef.current = null
    }
  }, [])

  const renderWidget = useCallback(
    (node: HTMLDivElement) => {
      const sitekey = getTurnstileSiteKey()
      if (!sitekey || !window.turnstile) return

      destroyWidget()
      node.replaceChildren()

      const generation = ++renderGenerationRef.current
      widgetIdRef.current = window.turnstile.render(node, {
        sitekey,
        theme: colorMode === 'dark' ? 'dark' : 'light',
        callback: (token) => {
          if (generation !== renderGenerationRef.current) return
          onTokenChangeRef.current(token)
        },
        'expired-callback': () => {
          if (generation !== renderGenerationRef.current) return
          onTokenChangeRef.current(null)
        },
        'error-callback': () => {
          if (generation !== renderGenerationRef.current) return
          onTokenChangeRef.current(null)
        },
        'timeout-callback': () => {
          if (generation !== renderGenerationRef.current) return
          onTokenChangeRef.current(null)
        },
      })
    },
    [colorMode, destroyWidget],
  )

  const onContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!isTurnstileConfigured()) return

      if (!node) {
        destroyWidget()
        containerRef.current = null
        return
      }

      containerRef.current = node
      const needsRerender =
        lastResetRef.current !== resetSignal || !widgetIdRef.current
      lastResetRef.current = resetSignal

      if (!needsRerender && widgetIdRef.current) return

      onTokenChangeRef.current(null)
      void loadTurnstileScript()
        .then(() => {
          if (containerRef.current !== node) return
          renderWidget(node)
        })
        .catch(() => {
          onTokenChangeRef.current(null)
        })
    },
    [destroyWidget, renderWidget, resetSignal],
  )

  if (!isTurnstileConfigured()) return null

  return (
    <Box w="full">
      <Text
        as="label"
        id="turnstile-label"
        fontSize="sm"
        fontWeight={600}
        color="text.default"
        mb={2}
        display="block"
      >
        {label}
      </Text>
      <Box
        ref={onContainerRef}
        key={`${colorMode}-${resetSignal}`}
        aria-labelledby="turnstile-label"
        minH="65px"
        display="flex"
        justifyContent="flex-start"
      />
    </Box>
  )
}

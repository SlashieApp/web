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

let turnstileScriptPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-slashie-turnstile]',
    )
    if (existing) {
      if (window.turnstile) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => {
          turnstileScriptPromise = null
          reject(new Error('Turnstile script failed to load'))
        },
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.dataset.slashieTurnstile = '1'
    script.onload = () => resolve()
    script.onerror = () => {
      turnstileScriptPromise = null
      reject(new Error('Turnstile script failed to load'))
    }
    document.head.appendChild(script)
  })

  return turnstileScriptPromise
}

type TurnstileMountProps = {
  theme: 'light' | 'dark'
  onTokenChange: (token: string | null) => void
}

/**
 * Mounts once per `key` from the parent. Stable callback ref so parent
 * re-renders (typing email, etc.) do not tear down the widget.
 */
function TurnstileMount({ theme, onTokenChange }: TurnstileMountProps) {
  const widgetIdRef = useRef<string | null>(null)
  const onTokenChangeRef = useRef(onTokenChange)
  onTokenChangeRef.current = onTokenChange
  const themeRef = useRef(theme)
  themeRef.current = theme
  const startedRef = useRef(false)

  const onContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // Widget may already be gone.
        }
        widgetIdRef.current = null
      }
      startedRef.current = false
      return
    }

    if (startedRef.current) return
    startedRef.current = true

    const sitekey = getTurnstileSiteKey()
    if (!sitekey) return

    void loadTurnstileScript()
      .then(() => {
        if (!node.isConnected || !window.turnstile) return
        if (widgetIdRef.current) return

        widgetIdRef.current = window.turnstile.render(node, {
          sitekey,
          theme: themeRef.current,
          callback: (token) => onTokenChangeRef.current(token),
          'expired-callback': () => onTokenChangeRef.current(null),
          'error-callback': () => onTokenChangeRef.current(null),
          'timeout-callback': () => onTokenChangeRef.current(null),
        })
      })
      .catch(() => {
        startedRef.current = false
        onTokenChangeRef.current(null)
      })
  }, [])

  return (
    <Box
      ref={onContainerRef}
      minH="65px"
      display="flex"
      justifyContent="flex-start"
    />
  )
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
  const theme = colorMode === 'dark' ? 'dark' : 'light'

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
      <Box aria-labelledby="turnstile-label">
        <TurnstileMount
          key={`${theme}-${resetSignal}`}
          theme={theme}
          onTokenChange={onTokenChange}
        />
      </Box>
    </Box>
  )
}

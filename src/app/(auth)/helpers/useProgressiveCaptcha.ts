'use client'

import { useCallback, useState } from 'react'

import {
  AUTH_CAPTCHA_FAIL_THRESHOLD,
  isTurnstileConfigured,
} from './turnstileConfig'

type ProgressiveCaptchaOptions = {
  /** Initial fail count (e.g. from sessionStorage). */
  initialFailCount?: number
  threshold?: number
  /**
   * When true, CAPTCHA is always required while Turnstile is configured
   * (forgot-password). Progressive forms leave this false.
   */
  alwaysRequire?: boolean
}

/**
 * Progressive CAPTCHA gate: after N client fails (or when the API demands it),
 * require a Turnstile token. Skips entirely when the site key is unset.
 */
export function useProgressiveCaptcha(options: ProgressiveCaptchaOptions = {}) {
  const {
    initialFailCount = 0,
    threshold = AUTH_CAPTCHA_FAIL_THRESHOLD,
    alwaysRequire = false,
  } = options

  const configured = isTurnstileConfigured()
  const [failCount, setFailCount] = useState(initialFailCount)
  const [apiRequiresCaptcha, setApiRequiresCaptcha] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [resetSignal, setResetSignal] = useState(0)

  const requiresCaptcha =
    configured &&
    (alwaysRequire || apiRequiresCaptcha || failCount >= threshold)

  const resetChallenge = useCallback(() => {
    setToken(null)
    setResetSignal((n) => n + 1)
  }, [])

  const markApiRequiresCaptcha = useCallback(() => {
    setApiRequiresCaptcha(true)
    resetChallenge()
  }, [resetChallenge])

  const setFailCountSafe = useCallback((count: number) => {
    setFailCount(Math.max(0, count))
  }, [])

  return {
    configured,
    requiresCaptcha,
    failCount,
    setFailCount: setFailCountSafe,
    token,
    setToken,
    resetSignal,
    resetChallenge,
    markApiRequiresCaptcha,
    hadCaptcha: Boolean(token),
  }
}

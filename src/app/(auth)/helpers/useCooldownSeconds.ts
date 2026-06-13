'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useCooldownSeconds() {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearCooldown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setSeconds(0)
  }, [])

  const startCooldown = useCallback((initial: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const value = Math.max(0, Math.ceil(initial))
    if (value <= 0) {
      setSeconds(0)
      return
    }

    setSeconds(value)
    intervalRef.current = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 0
        }
        return current - 1
      })
    }, 1000)
  }, [])

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    },
    [],
  )

  return {
    seconds,
    startCooldown,
    clearCooldown,
    isActive: seconds > 0,
  }
}

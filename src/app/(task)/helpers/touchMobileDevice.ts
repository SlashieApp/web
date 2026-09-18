import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

type NavigatorWithUAData = Navigator & {
  userAgentData?: { mobile?: boolean }
}

/** Phone UA — tablets (including iPadOS “Macintosh” + touch) stay false. */
export function isPhoneUserAgent(
  userAgent: string,
  maxTouchPoints: number,
): boolean {
  if (/iPad|Tablet|PlayBook/i.test(userAgent)) return false
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return false
  return /Mobi|Android.*Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  )
}

export function isTouchMobileDeviceFrom(input: {
  touch: boolean
  uaDataMobile?: boolean | null
  userAgent: string
  maxTouchPoints: number
}): boolean {
  if (!input.touch) return false
  if (typeof input.uaDataMobile === 'boolean') return input.uaDataMobile
  return isPhoneUserAgent(input.userAgent, input.maxTouchPoints)
}

/**
 * True only for a phone that supports touch. Narrow desktop/tablet viewports
 * and iPad keep Mapbox +/− so a mouse or trackpad can still zoom.
 */
export function isTouchMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  const maxTouchPoints = navigator.maxTouchPoints ?? 0
  const touch = maxTouchPoints > 0 || 'ontouchstart' in window
  const uaData = (navigator as NavigatorWithUAData).userAgentData
  return isTouchMobileDeviceFrom({
    touch,
    uaDataMobile: typeof uaData?.mobile === 'boolean' ? uaData.mobile : null,
    userAgent: navigator.userAgent,
    maxTouchPoints,
  })
}

/** Hydration-safe: false on the server snapshot, then the real device on the client. */
export function useIsTouchMobileDevice(): boolean {
  return useSyncExternalStore(subscribe, isTouchMobileDevice, () => false)
}

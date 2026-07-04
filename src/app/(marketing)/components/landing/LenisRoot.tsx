'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Smooth scrolling for the marketing landing only (mounted from the landing
 * page, so app routes are untouched). Skipped entirely under reduced motion;
 * `anchors` keeps in-page links ("See how it works") smooth too.
 */
export function LenisRoot() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      duration: 1.1,
    })

    return () => {
      lenis.destroy()
    }
  }, [])

  return null
}

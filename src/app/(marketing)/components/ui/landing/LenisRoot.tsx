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

    // Anchor scrolling is native (CSS `scroll-behavior: smooth` in
    // globals.css): Lenis `anchors` would double-handle hash clicks alongside
    // the browser/Next and cause a jump-then-snap glitch.
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
    })

    return () => {
      lenis.destroy()
    }
  }, [])

  return null
}

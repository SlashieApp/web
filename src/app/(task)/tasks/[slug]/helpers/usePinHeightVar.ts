'use client'

import { type RefObject, useLayoutEffect } from 'react'

import { TASK_DETAIL_PIN_HEIGHT_VAR } from './taskDetailPinClearance'

/**
 * Publishes the pin's height as a CSS variable on the root, so the spacer under
 * the page (`TASK_DETAIL_PIN_CLEARANCE`) follows it. Cleared when the pin goes.
 */
export function usePinHeightVar(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const publish = () => {
      // The web layout hides the pin (display: none) and reports 0.
      root.style.setProperty(
        TASK_DETAIL_PIN_HEIGHT_VAR,
        `${el.getBoundingClientRect().height}px`,
      )
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty(TASK_DETAIL_PIN_HEIGHT_VAR)
    }
  })
}

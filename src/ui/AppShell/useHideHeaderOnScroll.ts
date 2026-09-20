import { useCallback, useRef, useState } from 'react'

import {
  HEADER_HIDE_LOCK_MS,
  HEADER_HIDE_TOP_REVEAL_PX,
  nextHeaderHidden,
} from './nextHeaderHidden'

/** Matches Chakra `lg` (1024px): hide-on-scroll is mobile-only. */
const MOBILE_HEADER_QUERY = '(max-width: 63.99rem)'

/**
 * Tracks the scrolling `main` pane and returns whether the shell header should
 * tuck away. Only active when `enabled` (task detail). Attaches via callback
 * ref — no layout effect.
 */
export function useHideHeaderOnScroll(enabled: boolean) {
  const [hidden, setHidden] = useState(false)
  if (!enabled && hidden) {
    setHidden(false)
  }

  const lastYRef = useRef(0)
  const hiddenRef = useRef(false)
  const hideLockUntilRef = useRef(0)
  const enabledRef = useRef(enabled)
  const nodeRef = useRef<HTMLElement | null>(null)
  const detachRef = useRef<(() => void) | null>(null)
  enabledRef.current = enabled
  if (!enabled) hiddenRef.current = false

  const onScrollRootRef = useCallback((node: HTMLElement | null) => {
    if (node === nodeRef.current) return
    detachRef.current?.()
    detachRef.current = null
    nodeRef.current = node
    lastYRef.current = 0
    hiddenRef.current = false
    hideLockUntilRef.current = 0
    setHidden(false)
    if (!node) return

    const mq = window.matchMedia(MOBILE_HEADER_QUERY)

    const apply = (next: boolean) => {
      if (next === hiddenRef.current) return
      const now = performance.now()
      if (
        !next &&
        hiddenRef.current &&
        node.scrollTop > HEADER_HIDE_TOP_REVEAL_PX &&
        now < hideLockUntilRef.current
      ) {
        return
      }
      if (next) hideLockUntilRef.current = now + HEADER_HIDE_LOCK_MS
      hiddenRef.current = next
      setHidden(next)
    }

    const onScroll = () => {
      if (!enabledRef.current || !mq.matches) {
        apply(false)
        lastYRef.current = node.scrollTop
        return
      }
      const y = node.scrollTop
      apply(
        nextHeaderHidden({
          hidden: hiddenRef.current,
          y,
          lastY: lastYRef.current,
        }),
      )
      lastYRef.current = y
    }

    const onMq = () => {
      if (!mq.matches) apply(false)
    }

    node.addEventListener('scroll', onScroll, { passive: true })
    mq.addEventListener('change', onMq)
    detachRef.current = () => {
      node.removeEventListener('scroll', onScroll)
      mq.removeEventListener('change', onMq)
    }
  }, [])

  return { hidden: enabled && hidden, onScrollRootRef }
}

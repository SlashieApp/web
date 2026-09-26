'use client'

import { animate, useMotionValue } from 'motion/react'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import type { DrawerPlacement } from './Drawer'
import {
  SHEET_IN_FLIGHT_SLOP_PX,
  SHEET_SLOP_PX,
  type SheetDir,
  clientDeltaToOffset,
  offscreenTransform,
  offsetToTranslate,
  resolveSheetSettle,
  rubberBandOffset,
  scrimOpacity,
  scrollCanAbsorb,
  sheetAxis,
  sheetTransition,
  translate3d,
  velocityFromSamples,
} from './sheetMotion'

/**
 * Gesture sheet for `@ui` Drawer.
 *
 * Vaul dismisses with a CSS bezier, so a grab cannot retarget a spring and
 * there is no flick-only bounce. Motion already ships in this app:
 * `animate()` on a motion value starts from the current presentation value
 * plus release velocity, which is what makes mid-open / mid-close grabs
 * reversible. Gentle releases use `bounce: 0` (damping ratio 1). Flicks use
 * a small bounce. `prefers-reduced-motion` snaps.
 *
 * `open` is controlled by the parent, so the entrance/exit spring has to
 * start from that prop. That sync runs in `useLayoutEffect` (before paint)
 * so the sheet does not flash at rest.
 */

type PointerSession = {
  pointerId: number
  startX: number
  startY: number
  lastX: number
  lastY: number
  dragging: boolean
  interrupted: boolean
  scrollEl: HTMLElement | null
  dragStartX: number
  dragStartY: number
  dragOrigin: number
  samples: { t: number; offset: number }[]
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function readDirection(node: HTMLElement): SheetDir {
  return getComputedStyle(node).direction === 'rtl' ? 'rtl' : 'ltr'
}

function measureTravel(node: HTMLElement, placement: DrawerPlacement): number {
  const size =
    placement === 'top' || placement === 'bottom'
      ? node.offsetHeight
      : node.offsetWidth
  return size > 0 ? size : 0
}

function isFormControl(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable="true"], [role="slider"]',
    ),
  )
}

function findScrollable(
  target: EventTarget | null,
  boundary: HTMLElement,
): HTMLElement | null {
  let node = target instanceof Element ? target : null
  while (node && node !== boundary) {
    if (node instanceof HTMLElement) {
      const overflow = getComputedStyle(node).overflowY
      if (
        (overflow === 'auto' ||
          overflow === 'scroll' ||
          overflow === 'overlay') &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        return node
      }
    }
    node = node.parentElement
  }
  return null
}

function swallowClickAfterDrag() {
  const swallow = (event: MouseEvent) => {
    cleanup()
    event.preventDefault()
    event.stopPropagation()
  }
  const cleanup = () => {
    window.removeEventListener('click', swallow, true)
    window.clearTimeout(timer)
  }
  window.addEventListener('click', swallow, true)
  const timer = window.setTimeout(cleanup, 400)
}

function applyFrame(
  offset: number,
  travel: number,
  panel: HTMLElement | null,
  backdrop: HTMLElement | null,
  placement: DrawerPlacement,
  dir: SheetDir,
) {
  if (panel) {
    const { x, y } = offsetToTranslate(offset, sheetAxis(placement, dir))
    panel.style.transform = translate3d(x, y)
  }
  if (backdrop) backdrop.style.opacity = String(scrimOpacity(offset, travel))
}

export function useDrawerSheet({
  open,
  placement,
  onOpenChange,
}: {
  open: boolean
  placement: DrawerPlacement
  onOpenChange: (open: boolean) => void
}) {
  const [present, setPresent] = useState(open)
  const [seenOpen, setSeenOpen] = useState(open)
  if (open !== seenOpen) {
    setSeenOpen(open)
    if (open) setPresent(true)
  }

  const offset = useMotionValue(0)
  const panelRef = useRef<HTMLElement | null>(null)
  const backdropRef = useRef<HTMLElement | null>(null)
  const placementRef = useRef(placement)
  const openRef = useRef(open)
  const onOpenChangeRef = useRef(onOpenChange)
  const dirRef = useRef<SheetDir>('ltr')
  const travelRef = useRef(0)
  const intentRef = useRef<'open' | 'closed'>(open ? 'open' : 'closed')
  const enteredRef = useRef(false)
  const sessionRef = useRef<PointerSession | null>(null)
  const generationRef = useRef(0)
  const animRef = useRef<{ stop: () => void } | null>(null)
  const detachPointerRef = useRef<(() => void) | null>(null)
  const panelCleanupRef = useRef<(() => void) | null>(null)

  placementRef.current = placement
  openRef.current = open
  onOpenChangeRef.current = onOpenChange
  if (!present) enteredRef.current = false

  const stopAnimation = useCallback(() => {
    generationRef.current += 1
    animRef.current?.stop()
    animRef.current = null
  }, [])

  const commit = useCallback(
    (next: number, travel: number) => {
      offset.set(next)
      applyFrame(
        next,
        travel,
        panelRef.current,
        backdropRef.current,
        placementRef.current,
        dirRef.current,
      )
    },
    [offset],
  )

  const springTo = useCallback(
    (
      target: number,
      options: { flick: boolean; velocity: number; intent: 'open' | 'closed' },
    ) => {
      const panel = panelRef.current
      const travel = travelRef.current
      intentRef.current = options.intent
      if (prefersReducedMotion()) {
        stopAnimation()
        if (options.intent === 'closed') setPresent(false)
        else if (panel) commit(0, travel)
        return
      }
      const transition = sheetTransition(options.flick, false)
      if (transition.type !== 'spring') return
      const generation = ++generationRef.current
      animRef.current?.stop()
      const controls = animate(offset, target, {
        type: 'spring',
        bounce: transition.bounce,
        duration: transition.duration,
        velocity: options.velocity,
        onUpdate: (latest) => {
          applyFrame(
            latest,
            travelRef.current,
            panelRef.current,
            backdropRef.current,
            placementRef.current,
            dirRef.current,
          )
        },
      })
      animRef.current = controls
      void controls.then(() => {
        if (generationRef.current !== generation) return
        animRef.current = null
        if (options.intent === 'closed') setPresent(false)
      })
    },
    [commit, offset, stopAnimation],
  )

  const endDrag = useCallback(
    (session: PointerSession) => {
      sessionRef.current = null
      const panel = panelRef.current
      if (panel) panel.style.userSelect = ''
      if (!panel) return
      const travel =
        measureTravel(panel, placementRef.current) || travelRef.current
      travelRef.current = travel

      if (!session.dragging) {
        if (session.interrupted) {
          const intent = intentRef.current
          springTo(intent === 'open' ? 0 : travel, {
            flick: false,
            velocity: 0,
            intent,
          })
        }
        return
      }

      const velocity = Math.max(
        -4000,
        Math.min(4000, velocityFromSamples(session.samples)),
      )
      const decision = resolveSheetSettle({
        offset: offset.get(),
        travel,
        velocity,
      })
      const targetOpen = decision.target === 'open'
      springTo(targetOpen ? 0 : travel, {
        flick: decision.flick,
        velocity,
        intent: decision.target,
      })
      if (targetOpen !== openRef.current) onOpenChangeRef.current(targetOpen)
      swallowClickAfterDrag()
    },
    [offset, springTo],
  )

  const moveDrag = useCallback(
    (event: PointerEvent, session: PointerSession, panel: HTMLElement) => {
      if (session.dragging) {
        const travel =
          measureTravel(panel, placementRef.current) || travelRef.current
        travelRef.current = travel
        const along = clientDeltaToOffset(
          event.clientX - session.dragStartX,
          event.clientY - session.dragStartY,
          sheetAxis(placementRef.current, dirRef.current),
        )
        const next = rubberBandOffset(session.dragOrigin + along, travel)
        commit(next, travel)
        session.samples.push({ t: performance.now(), offset: next })
        if (session.samples.length > 8) session.samples.shift()
        return
      }

      const dx = event.clientX - session.lastX
      const dy = event.clientY - session.lastY
      session.lastX = event.clientX
      session.lastY = event.clientY
      const totalDx = event.clientX - session.startX
      const totalDy = event.clientY - session.startY
      const axis = sheetAxis(placementRef.current, dirRef.current)
      const slop = session.interrupted ? SHEET_IN_FLIGHT_SLOP_PX : SHEET_SLOP_PX

      if (axis.axis === 'y' && !session.interrupted && session.scrollEl) {
        const incremental = clientDeltaToOffset(dx, dy, axis)
        const vertical = Math.abs(totalDy) >= Math.abs(totalDx)
        if (
          vertical &&
          scrollCanAbsorb(session.scrollEl, incremental) &&
          Math.hypot(totalDx, totalDy) >= 1
        ) {
          session.scrollEl.scrollTop -= dy
          return
        }
      }

      if (Math.hypot(totalDx, totalDy) < slop) return
      if (
        !session.interrupted &&
        axis.axis === 'x' &&
        Math.abs(totalDx) < Math.abs(totalDy)
      ) {
        return
      }
      if (
        !session.interrupted &&
        axis.axis === 'y' &&
        Math.abs(totalDy) < Math.abs(totalDx)
      ) {
        return
      }

      session.dragging = true
      session.dragStartX = event.clientX
      session.dragStartY = event.clientY
      session.dragOrigin = offset.get()
      session.samples = [{ t: performance.now(), offset: offset.get() }]
      panel.style.userSelect = 'none'
      if (panel.setPointerCapture) {
        try {
          panel.setPointerCapture(event.pointerId)
        } catch {
          // The pointer may already be gone.
        }
      }
    },
    [commit, offset],
  )

  const onPointerDownRef = useRef<(event: PointerEvent) => void>(() => {})
  onPointerDownRef.current = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return
    if (isFormControl(event.target)) return
    const panel = panelRef.current
    if (!panel || sessionRef.current) return

    const interrupted = animRef.current != null
    if (interrupted) stopAnimation()

    const axis = sheetAxis(placementRef.current, dirRef.current)
    const session: PointerSession = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      dragging: false,
      interrupted,
      scrollEl: axis.axis === 'y' ? findScrollable(event.target, panel) : null,
      dragStartX: event.clientX,
      dragStartY: event.clientY,
      dragOrigin: offset.get(),
      samples: [],
    }
    sessionRef.current = session

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== session.pointerId) return
      if (session.dragging) moveEvent.preventDefault()
      moveDrag(moveEvent, session, panel)
    }
    const onUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== session.pointerId) return
      detach()
      endDrag(session)
    }
    const detach = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      if (detachPointerRef.current === detach) detachPointerRef.current = null
    }
    detachPointerRef.current = detach
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  const setPanel = useCallback((node: HTMLElement | null) => {
    panelCleanupRef.current?.()
    panelCleanupRef.current = null
    panelRef.current = node
    if (!node) return
    dirRef.current = readDirection(node)
    node.style.willChange = 'transform'
    if (!enteredRef.current) {
      node.style.transform = offscreenTransform(
        placementRef.current,
        dirRef.current,
      )
    }
    const onDown = (event: PointerEvent) => onPointerDownRef.current(event)
    const onTouchMove = (event: TouchEvent) => {
      if (sessionRef.current?.dragging) event.preventDefault()
    }
    node.addEventListener('pointerdown', onDown)
    node.addEventListener('touchmove', onTouchMove, { passive: false })
    panelCleanupRef.current = () => {
      node.removeEventListener('pointerdown', onDown)
      node.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const setBackdrop = useCallback((node: HTMLElement | null) => {
    backdropRef.current = node
  }, [])

  useLayoutEffect(() => {
    if (!present) {
      detachPointerRef.current?.()
      sessionRef.current = null
      return
    }

    let cancelled = false
    let raf = 0
    let tries = 0

    const run = () => {
      if (cancelled) return
      const panel = panelRef.current
      tries += 1
      if (!panel) {
        if (tries < 8) raf = requestAnimationFrame(run)
        return
      }
      dirRef.current = readDirection(panel)
      const travel = measureTravel(panel, placement)
      if (travel < 1 && tries < 8) {
        raf = requestAnimationFrame(run)
        return
      }
      if (travel < 1) {
        stopAnimation()
        if (open) {
          enteredRef.current = true
          commit(0, 1)
        } else {
          setPresent(false)
        }
        return
      }
      travelRef.current = travel
      if (sessionRef.current) return

      const intent: 'open' | 'closed' = open ? 'open' : 'closed'
      if (animRef.current && intentRef.current === intent) return

      if (prefersReducedMotion()) {
        stopAnimation()
        intentRef.current = intent
        if (intent === 'open') {
          enteredRef.current = true
          commit(0, travel)
        } else {
          setPresent(false)
        }
        return
      }

      if (
        intent === 'open' &&
        !enteredRef.current &&
        Math.abs(offset.get()) < 1
      ) {
        commit(travel, travel)
      }
      if (intent === 'open') enteredRef.current = true
      springTo(intent === 'open' ? 0 : travel, {
        flick: false,
        velocity: 0,
        intent,
      })
    }

    run()
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [commit, offset, open, placement, present, springTo, stopAnimation])

  useLayoutEffect(() => {
    return () => {
      generationRef.current += 1
      animRef.current?.stop()
      animRef.current = null
      detachPointerRef.current?.()
      panelCleanupRef.current?.()
    }
  }, [])

  const touchAction =
    placement === 'top' || placement === 'bottom' ? 'none' : 'pan-y'

  return { present, setPanel, setBackdrop, touchAction }
}

'use client'

import { Box } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react'

/** Chakra `md` breakpoint for carousel peek behavior. */
const MD_MEDIA = '(min-width: 48em)'
/** Horizontal inset on carousel viewport. */
const CAROUSEL_INSET = { base: 2, md: 3 } as const
/** Extra peek on md+ so adjacent slides show at the edges. */
const SLIDE_PEEK_MD_PX = 52
/** Movement above this (px) counts as a carousel drag, not a card tap. */
const CAROUSEL_DRAG_THRESHOLD_PX = 8
/** Embla programmatic scroll / snap animation (ms). */
const CAROUSEL_SCROLL_DURATION_MS = 20

type CarouselPointerGesture = {
  didDrag: boolean
  startX: number
  startY: number
}

function measureCarouselLayout(viewportWidth: number): {
  centeringPadPx: number
  slideWidthPx: number
} {
  const isMd =
    typeof window !== 'undefined' && window.matchMedia(MD_MEDIA).matches
  const peekTotal = isMd ? SLIDE_PEEK_MD_PX : 0
  const slideWidthPx = Math.min(600, Math.max(0, viewportWidth - peekTotal))
  const centeringPadPx = Math.max(
    0,
    Math.round((viewportWidth - slideWidthPx) / 2),
  )
  return { centeringPadPx, slideWidthPx }
}

/** Per-slide state handed to the render prop. */
export type MobileCarouselItemState = {
  /** This slide is the current Embla snap. */
  isCentered: boolean
  /** A selection is active and this slide is a visible neighbour. */
  isPeekAdjacent: boolean
  /** For neighbours: which way a tap will scroll the carousel. */
  peekDirection: 'next' | 'prev'
  /** Highlight state: the focused (snap) id, falling back to `selectedId`. */
  isActive: boolean
  /** Cursor the card's activatable shell should show. */
  activateCursor: 'pointer' | 'grab'
  /** Tap handler: centered → `onActivateCentered`; neighbour → snap to it. */
  activate: () => void
}

export type MobileCarouselProps<T extends { id: string }> = {
  items: readonly T[]
  /** Externally selected id (e.g. a map pin); the carousel scrolls to it. */
  selectedId: string | null
  /** The snap changed (swipe/tap) — mirror it into the external selection. */
  onSnapSelect: (id: string) => void
  /** The centered card was tapped (open its detail view). */
  onActivateCentered: (id: string) => void
  /** Freeze all interaction (e.g. while a nav route presents on the map). */
  disabled?: boolean
  children: (item: T, state: MobileCarouselItemState) => ReactNode
}

/**
 * Center-snapping card strip over the map (mobile browse/search). Owns the
 * Embla wiring, drag-vs-tap detection, slide sizing with md+ peek, edge fade,
 * and two-way selection sync:
 *
 * - swiping (or tapping a peeking neighbour) snaps and calls `onSnapSelect`;
 * - changing `selectedId` externally scrolls the strip to that card;
 * - tapping the centered card calls `onActivateCentered`.
 *
 * Render prop only — cards stay feature-owned. Renders nothing when `items`
 * is empty (the caller owns its empty state).
 */
export function MobileCarousel<T extends { id: string }>({
  items,
  selectedId,
  onSnapSelect,
  onActivateCentered,
  disabled = false,
  children,
}: MobileCarouselProps<T>) {
  const pointerGestureRef = useRef<CarouselPointerGesture>({
    didDrag: false,
    startX: 0,
    startY: 0,
  })
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    /** Allow first/last slide to reach true center with symmetric track padding. */
    containScroll: false,
    dragFree: false,
    duration: CAROUSEL_SCROLL_DURATION_MS,
  })

  const viewportElRef = useRef<HTMLDivElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const emblaApiRef = useRef(emblaApi)
  emblaApiRef.current = emblaApi

  const onSnapSelectRef = useRef(onSnapSelect)
  onSnapSelectRef.current = onSnapSelect
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const itemIdsRef = useRef<string[]>([])
  itemIdsRef.current = items.map((item) => item.id)
  const disabledRef = useRef(disabled)
  disabledRef.current = disabled

  const mediaQueryCleanupRef = useRef<(() => void) | null>(null)
  const emblaEventsCleanupRef = useRef<(() => void) | null>(null)
  const emblaEventsApiRef = useRef<typeof emblaApi>(null)
  /** Skip scrollTo when selection was driven by carousel (avoids snap fight). */
  const selectionFromCarouselRef = useRef(false)
  const [focusedId, setFocusedId] = useState<string | null>(selectedId)
  const focusedIdRef = useRef(focusedId)
  focusedIdRef.current = focusedId
  const [isGrabbing, setIsGrabbing] = useState(false)

  const onCarouselPointerDown = useCallback((event: ReactPointerEvent) => {
    setIsGrabbing(true)
    pointerGestureRef.current = {
      didDrag: false,
      startX: event.clientX,
      startY: event.clientY,
    }
  }, [])

  const onCarouselPointerMove = useCallback((event: ReactPointerEvent) => {
    const gesture = pointerGestureRef.current
    if (
      Math.abs(event.clientX - gesture.startX) > CAROUSEL_DRAG_THRESHOLD_PX ||
      Math.abs(event.clientY - gesture.startY) > CAROUSEL_DRAG_THRESHOLD_PX
    ) {
      gesture.didDrag = true
    }
  }, [])

  const onCarouselPointerUp = useCallback(() => {
    setIsGrabbing(false)
    queueMicrotask(() => {
      pointerGestureRef.current.didDrag = false
    })
  }, [])

  const onActivateCenteredRef = useRef(onActivateCentered)
  onActivateCenteredRef.current = onActivateCentered

  const handleCardActivate = useCallback((itemId: string) => {
    if (pointerGestureRef.current.didDrag) return
    if (disabledRef.current) return

    const live = emblaApiRef.current
    const centeredId = live
      ? itemIdsRef.current[live.selectedScrollSnap()]
      : null

    if (selectedIdRef.current && centeredId && itemId !== centeredId && live) {
      const snap = live.selectedScrollSnap()
      const idx = itemIdsRef.current.indexOf(itemId)
      if (idx < 0) return
      selectionFromCarouselRef.current = true
      if (idx > snap) {
        live.scrollNext()
      } else if (idx < snap) {
        live.scrollPrev()
      }
      return
    }

    onActivateCenteredRef.current(itemId)
  }, [])

  const syncSelectionFromCarousel = useCallback(() => {
    if (disabledRef.current) return
    const live = emblaApiRef.current
    if (!live) return
    const idx = live.selectedScrollSnap()
    const id = itemIdsRef.current[idx]
    if (!id) return

    focusedIdRef.current = id
    setFocusedId(id)
    selectionFromCarouselRef.current = true
    onSnapSelectRef.current(id)
  }, [])

  const lastEmblaLayoutRef = useRef<{
    pad: number
    slideWidth: number
    itemIds: string
    api: NonNullable<typeof emblaApi> | null
  }>({ pad: -1, slideWidth: -1, itemIds: '', api: null })

  const lastExternalScrollKeyRef = useRef('')

  const [carouselLayout, setCarouselLayout] = useState({
    centeringPadPx: 0,
    slideWidthPx: 0,
  })

  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      mediaQueryCleanupRef.current?.()
      mediaQueryCleanupRef.current = null
      emblaEventsCleanupRef.current?.()
      emblaEventsCleanupRef.current = null
      emblaEventsApiRef.current = null
      viewportElRef.current = node
      emblaRef(node)
      if (!node) return

      const measure = () => {
        setCarouselLayout(measureCarouselLayout(node.clientWidth))
      }
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(node)
      resizeObserverRef.current = ro
      if (typeof window !== 'undefined') {
        const mq = window.matchMedia(MD_MEDIA)
        mq.addEventListener('change', measure)
        mediaQueryCleanupRef.current = () => {
          mq.removeEventListener('change', measure)
        }
      }
    },
    [emblaRef],
  )

  const { centeringPadPx, slideWidthPx } = carouselLayout
  const pad = centeringPadPx
  const itemIdsKey = itemIdsRef.current.join(',')
  const api = emblaApi
  if (api && emblaEventsApiRef.current !== api) {
    emblaEventsCleanupRef.current?.()
    api.on('select', syncSelectionFromCarousel)
    api.on('reInit', syncSelectionFromCarousel)
    emblaEventsCleanupRef.current = () => {
      api.off('select', syncSelectionFromCarousel)
      api.off('reInit', syncSelectionFromCarousel)
    }
    emblaEventsApiRef.current = api
    queueMicrotask(syncSelectionFromCarousel)
  }

  if (api) {
    const prev = lastEmblaLayoutRef.current
    const layoutChanged =
      prev.api !== api ||
      prev.pad !== pad ||
      prev.slideWidth !== slideWidthPx ||
      prev.itemIds !== itemIdsKey

    if (layoutChanged) {
      lastEmblaLayoutRef.current = {
        api,
        pad,
        slideWidth: slideWidthPx,
        itemIds: itemIdsKey,
      }
      const sel = selectedIdRef.current
      const idOrder = [...itemIdsRef.current]
      queueMicrotask(() => {
        const live = emblaApiRef.current
        if (!live) return
        live.reInit()
        if (!sel) {
          syncSelectionFromCarousel()
          return
        }
        const idx = idOrder.indexOf(sel)
        if (idx >= 0) live.scrollTo(idx, true)
      })
    }
  }

  if (selectionFromCarouselRef.current) {
    selectionFromCarouselRef.current = false
    lastExternalScrollKeyRef.current = `${selectedId ?? ''}|${itemIdsKey}`
  } else if (api && selectedId) {
    const externalScrollKey = `${selectedId}|${itemIdsKey}`
    if (externalScrollKey !== lastExternalScrollKeyRef.current) {
      lastExternalScrollKeyRef.current = externalScrollKey
      if (focusedIdRef.current !== selectedId) {
        focusedIdRef.current = selectedId
        queueMicrotask(() => setFocusedId(selectedId))
      }
      const idx = itemIdsRef.current.indexOf(selectedId)
      if (idx >= 0 && idx !== api.selectedScrollSnap()) {
        queueMicrotask(() => {
          emblaApiRef.current?.scrollTo(idx, false)
        })
      }
    }
  } else if (!selectedId) {
    lastExternalScrollKeyRef.current = ''
    if (focusedIdRef.current !== null) {
      focusedIdRef.current = null
      queueMicrotask(() => setFocusedId(null))
    }
  }

  if (items.length === 0) return null

  const centeredId =
    api != null ? (itemIdsRef.current[api.selectedScrollSnap()] ?? null) : null
  const selectionActive = Boolean(selectedId)
  const snapIndex = api?.selectedScrollSnap() ?? -1

  const edgeFadeMask =
    centeringPadPx > 0
      ? {
          maskImage:
            'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 24px, rgba(0,0,0,1) calc(100% - 24px), rgba(0,0,0,0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 24px, rgba(0,0,0,1) calc(100% - 24px), rgba(0,0,0,0) 100%)',
        }
      : undefined

  return (
    <Box
      ref={setViewportRef}
      pointerEvents={disabled ? 'none' : 'auto'}
      overflow="hidden"
      px={CAROUSEL_INSET}
      mb={1}
      cursor={disabled ? 'default' : isGrabbing ? 'grabbing' : 'grab'}
      style={edgeFadeMask}
      css={{ touchAction: 'pan-y' }}
      onPointerDown={onCarouselPointerDown}
      onPointerMove={onCarouselPointerMove}
      onPointerUp={onCarouselPointerUp}
      onPointerLeave={onCarouselPointerUp}
      onPointerCancel={() => {
        setIsGrabbing(false)
        pointerGestureRef.current.didDrag = true
      }}
    >
      <Box
        display="flex"
        flexDirection="row"
        alignItems="stretch"
        gap={3}
        pl={`${centeringPadPx}px`}
        pr={`${centeringPadPx}px`}
        cursor="inherit"
        css={{ touchAction: 'pan-y' }}
      >
        {items.map((item, index) => {
          const isCentered = item.id === centeredId
          const isPeekAdjacent =
            selectionActive && centeredId != null && !isCentered
          const peekDirection: 'next' | 'prev' =
            index > snapIndex ? 'next' : 'prev'
          const slideCursor = disabled
            ? 'default'
            : isCentered
              ? 'pointer'
              : isGrabbing
                ? 'grabbing'
                : 'grab'

          const state: MobileCarouselItemState = {
            isCentered,
            isPeekAdjacent,
            peekDirection,
            isActive: (focusedId ?? selectedId) === item.id,
            activateCursor: isCentered ? 'pointer' : 'grab',
            activate: () => handleCardActivate(item.id),
          }

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flex: `0 0 ${slideWidthPx > 0 ? `${slideWidthPx}px` : '100%'}`,
                minWidth: 0,
                maxWidth: '100%',
                cursor: slideCursor,
                touchAction: 'pan-y',
              }}
            >
              {children(item, state)}
            </motion.div>
          )
        })}
      </Box>
    </Box>
  )
}

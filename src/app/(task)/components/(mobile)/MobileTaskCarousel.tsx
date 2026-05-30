'use client'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Box, HStack } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import {
  formatBudget,
  inferBadge,
  taskDistanceLabelFromReference,
  taskPosterAvatarUrl,
  taskPosterDisplayName,
} from '../../helpers/taskBrowseHelpers'
import { TaskCard } from '../TaskCard'
import { TaskEmptyState } from '../TaskEmptyState'

/** Matches Chakra `md` and Dock horizontal inset (`left`/`right: 2` on base). */
const MD_MEDIA = '(min-width: 48em)'
/** Horizontal inset on carousel viewport — same as mobile Dock (`spacing.2`). */
const CAROUSEL_INSET = { base: 2, md: 3 } as const
/** Extra peek on md+ so adjacent slides show at the edges. */
const SLIDE_PEEK_MD_PX = 52
/** Movement above this (px) counts as a carousel drag, not a card tap. */
const CAROUSEL_DRAG_THRESHOLD_PX = 8

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

export function MobileTaskCarousel() {
  const router = useRouter()
  const { pageItems, selectedTaskId, setSelectedTaskId, referenceLocation } =
    useTaskBrowseData()
  const pointerGestureRef = useRef<CarouselPointerGesture>({
    didDrag: false,
    startX: 0,
    startY: 0,
  })
  const tasks = useMemo(
    () =>
      pageItems.map((task) => {
        const { main } = formatBudget(task)
        const badge = inferBadge(task)
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          location:
            taskPublicLocationLabel(task).trim() || 'Location on request',
          priceLabel: main,
          badgeText: badge.text,
          thumbnailSrc: task.images?.[0] ?? undefined,
          ownerName: taskPosterDisplayName(task),
          ownerAvatarSrc: taskPosterAvatarUrl(task),
          distanceLabel: taskDistanceLabelFromReference(
            task,
            referenceLocation,
          ),
        }
      }),
    [pageItems, referenceLocation],
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'center',
      /** Allow first/last slide to reach true center with symmetric track padding. */
      containScroll: false,
      dragFree: false,
    },
    [WheelGesturesPlugin()],
  )

  const viewportElRef = useRef<HTMLDivElement | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const emblaApiRef = useRef(emblaApi)
  emblaApiRef.current = emblaApi

  const setSelectedTaskIdRef = useRef(setSelectedTaskId)
  setSelectedTaskIdRef.current = setSelectedTaskId
  const selectedTaskIdRef = useRef(selectedTaskId)
  selectedTaskIdRef.current = selectedTaskId
  const taskIdsRef = useRef<string[]>([])
  taskIdsRef.current = tasks.map((t) => t.id)

  const mediaQueryCleanupRef = useRef<(() => void) | null>(null)
  const emblaEventsCleanupRef = useRef<(() => void) | null>(null)
  const emblaEventsApiRef = useRef<typeof emblaApi>(null)

  const onCarouselPointerDown = useCallback((event: ReactPointerEvent) => {
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

  const openTaskDetail = useCallback(
    (taskId: string) => {
      if (pointerGestureRef.current.didDrag) return
      router.push(`/task/${taskId}`)
    },
    [router],
  )

  const syncSelectionFromCarousel = useCallback(() => {
    const live = emblaApiRef.current
    if (!live) return
    const idx = live.selectedScrollSnap()
    const id = taskIdsRef.current[idx]
    if (id && id !== selectedTaskIdRef.current) {
      setSelectedTaskIdRef.current(id)
    }
  }, [])

  const lastEmblaLayoutRef = useRef<{
    pad: number
    slideWidth: number
    selectedId: string | null
    taskIds: string
    api: NonNullable<typeof emblaApi> | null
  }>({ pad: -1, slideWidth: -1, selectedId: null, taskIds: '', api: null })

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
  const taskIdsKey = taskIdsRef.current.join(',')
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
    if (
      prev.api !== api ||
      prev.pad !== pad ||
      prev.slideWidth !== slideWidthPx ||
      prev.selectedId !== selectedTaskId ||
      prev.taskIds !== taskIdsKey
    ) {
      lastEmblaLayoutRef.current = {
        api,
        pad,
        slideWidth: slideWidthPx,
        selectedId: selectedTaskId,
        taskIds: taskIdsKey,
      }
      const sel = selectedTaskId
      const idOrder = [...taskIdsRef.current]
      queueMicrotask(() => {
        const live = emblaApiRef.current
        if (!live) return
        live.reInit()
        if (!sel) return
        const idx = idOrder.indexOf(sel)
        if (idx >= 0) live.scrollTo(idx)
      })
    }
  }

  if (tasks.length === 0) {
    return (
      <Box px={CAROUSEL_INSET} pb={2}>
        <TaskEmptyState />
      </Box>
    )
  }

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
      pointerEvents="auto"
      overflow="hidden"
      px={CAROUSEL_INSET}
      mb={1}
      style={edgeFadeMask}
      onPointerDown={onCarouselPointerDown}
      onPointerMove={onCarouselPointerMove}
      onPointerCancel={() => {
        pointerGestureRef.current.didDrag = true
      }}
    >
      <HStack
        gap={3}
        align="stretch"
        justify="flex-start"
        pl={`${centeringPadPx}px`}
        pr={`${centeringPadPx}px`}
        css={{
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {tasks.map((task) => {
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flex: `0 0 ${slideWidthPx > 0 ? `${slideWidthPx}px` : '100%'}`,
                minWidth: 0,
                maxWidth: '100%',
              }}
            >
              <TaskCard
                title={task.title}
                description={task.description}
                priceLabel={task.priceLabel}
                metaLine={task.location}
                distanceLabel={task.distanceLabel}
                thumbnailSrc={task.thumbnailSrc}
                detailsHref={`/task/${task.id}`}
                badgeText={task.badgeText}
                ownerName={task.ownerName}
                ownerAvatarSrc={task.ownerAvatarSrc}
                isActive={selectedTaskId === task.id}
                showDetailsCta={false}
                activateAriaLabel={`${task.title}. View task details.`}
                onActivate={() => openTaskDetail(task.id)}
              />
            </motion.div>
          )
        })}
      </HStack>
    </Box>
  )
}

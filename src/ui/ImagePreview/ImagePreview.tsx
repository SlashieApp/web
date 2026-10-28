'use client'

import {
  Box,
  DialogBackdrop,
  DialogCloseTrigger,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Flex,
  HStack,
  Image,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  LuChevronLeft,
  LuChevronRight,
  LuImageOff,
  LuX,
  LuZoomIn,
  LuZoomOut,
} from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { APP_OVERLAY_Z_INDEX, sdlMotion } from '@/theme/styles'
import { useIsBrowser } from '@/utils/useIsBrowser'

import { IconButton } from '../IconButton/IconButton'
import bag from './i11n.json'
import {
  MAX_ZOOM,
  MIN_ZOOM,
  type Point,
  type PreviewView,
  REST_VIEW,
  clampView,
  pinchView,
  zoomViewAt,
} from './zoomPan'

/**
 * SDL ImagePreview. Opens photos full screen over a blurred, darkened page.
 * Built on Chakra/Ark `Dialog` like `Modal`, so the focus trap, Escape,
 * scroll lock and focus return to the opening thumbnail come for free.
 *
 * - Zoom 1x to 4x: +/- buttons, wheel or trackpad pinch, touch pinch, and
 *   double-click or double-tap to toggle. Drag pans while zoomed, and the
 *   photo can't leave the screen.
 * - Several photos: previous/next (looping), arrow keys, swipe when not
 *   zoomed, and a "2 of 5" counter. Changing photo resets the zoom.
 * - Controls are dark chips on `bg.invertedRaised`, so they read on any
 *   photo in both themes.
 */

export type ImagePreviewItem = { src: string; alt: string }

export type ImagePreviewProps = {
  items: ImagePreviewItem[]
  /** The photo showing, or null when closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

/** Travel (px) under which a press is a tap, not a drag. */
const TAP_SLOP_PX = 10
/** A second tap this soon (ms) and this close (px) toggles the zoom. */
const DOUBLE_TAP_MS = 300
const DOUBLE_TAP_PX = 30
const DOUBLE_TAP_ZOOM = 2
/** Sideways travel (px) at 1x that changes photo. */
const SWIPE_PX = 50
const ZOOM_STEP = 1

/** Round dark control that reads on any photo, in both themes. */
const controlProps = {
  bg: 'bg.invertedRaised',
  color: 'text.onInverted',
  borderWidth: '1px',
  borderColor: 'border.glass',
  boxShadow: 'e2',
  pointerEvents: 'auto',
  _hover: { bg: 'bg.invertedSurface', color: 'text.onInverted' },
  _disabled: {
    color: 'text.onInvertedMuted',
    opacity: 0.5,
    cursor: 'not-allowed',
  },
} as const

/** Where `clientX/Y` falls, in px from the centre of `el`. */
function fromCentre(el: HTMLElement, clientX: number, clientY: number): Point {
  const rect = el.getBoundingClientRect()
  return {
    x: clientX - rect.left - rect.width / 2,
    y: clientY - rect.top - rect.height / 2,
  }
}

/** Safari's trackpad pinch; not in the DOM types. */
type GestureEvent = Event & { scale: number; clientX: number; clientY: number }

type Gesture = { view: PreviewView; points: Point[]; moved: boolean }

function PreviewBody({
  items,
  index,
  onIndexChange,
}: {
  items: ImagePreviewItem[]
  index: number
  onIndexChange: (index: number) => void
}) {
  const t = useI11n(bag)
  const item = items[index]
  const several = items.length > 1
  const stageRef = useRef<HTMLDivElement | null>(null)
  const photoRef = useRef<HTMLImageElement | null>(null)
  // Gestures build on this; the state below only drives the render.
  const viewRef = useRef(REST_VIEW)
  const [view, setView] = useState({ ...REST_VIEW, smooth: false })
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | null>(null)
  const lastTap = useRef<{ time: number; point: Point } | null>(null)
  const broken = brokenSrc === item.src

  /** Shows `next` within the zoom limits and the screen; `smooth` animates it. */
  const show = useCallback((next: PreviewView, smooth = false) => {
    const stage = stageRef.current
    const photo = photoRef.current
    const clamped =
      stage && photo
        ? clampView(
            next,
            { width: photo.offsetWidth, height: photo.offsetHeight },
            { width: stage.clientWidth, height: stage.clientHeight },
          )
        : REST_VIEW
    viewRef.current = clamped
    setView({ ...clamped, smooth })
  }, [])

  const go = (step: number) => {
    show(REST_VIEW)
    lastTap.current = null
    onIndexChange((index + step + items.length) % items.length)
  }

  const zoomBy = (step: number) => {
    const current = viewRef.current
    show(zoomViewAt(current, current.scale + step, { x: 0, y: 0 }), true)
  }

  // React's wheel listener is passive and can't stop the page zooming, so
  // attach real listeners once the viewer mounts.
  const rootRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      const onWheel = (event: WheelEvent) => {
        event.preventDefault()
        // Firefox may count lines; ctrl + wheel is a trackpad pinch.
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : 1)
        const current = viewRef.current
        const scale =
          current.scale * Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.002))
        show(
          zoomViewAt(
            current,
            scale,
            fromCentre(node, event.clientX, event.clientY),
          ),
        )
      }
      // Safari sends trackpad pinch as gesture events instead.
      let gestureStartScale = MIN_ZOOM
      const onGestureStart = (event: Event) => {
        event.preventDefault()
        gestureStartScale = viewRef.current.scale
      }
      const onGestureChange = (event: Event) => {
        event.preventDefault()
        // A touch pinch sends these too; the pointer handlers own that one.
        if (pointers.current.size > 0) return
        const { scale, clientX, clientY } = event as GestureEvent
        show(
          zoomViewAt(
            viewRef.current,
            gestureStartScale * scale,
            fromCentre(node, clientX, clientY),
          ),
        )
      }
      node.addEventListener('wheel', onWheel, { passive: false })
      node.addEventListener('gesturestart', onGestureStart)
      node.addEventListener('gesturechange', onGestureChange)
      return () => {
        node.removeEventListener('wheel', onWheel)
        node.removeEventListener('gesturestart', onGestureStart)
        node.removeEventListener('gesturechange', onGestureChange)
      }
    },
    [show],
  )

  /** Starts over from the current view, e.g. when a finger lands or lifts. */
  const restartGesture = () => {
    gesture.current = {
      view: viewRef.current,
      points: [...pointers.current.values()],
      moved: gesture.current?.moved ?? false,
    }
  }

  /** A second tap (or click) close by toggles between fitted and 2x there. */
  const tap = (point: Point, time: number) => {
    const last = lastTap.current
    const double =
      last &&
      time - last.time < DOUBLE_TAP_MS &&
      Math.hypot(point.x - last.point.x, point.y - last.point.y) < DOUBLE_TAP_PX
    if (!double) {
      lastTap.current = { time, point }
      return
    }
    lastTap.current = null
    const current = viewRef.current
    show(
      current.scale > MIN_ZOOM
        ? REST_VIEW
        : zoomViewAt(current, DOUBLE_TAP_ZOOM, point),
      true,
    )
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (event.isPrimary) {
      // A fresh press: forget any pointer whose release never arrived.
      pointers.current.clear()
      gesture.current = null
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(
      event.pointerId,
      fromCentre(event.currentTarget, event.clientX, event.clientY),
    )
    restartGesture()
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current
    if (!start || !pointers.current.has(event.pointerId)) return
    pointers.current.set(
      event.pointerId,
      fromCentre(event.currentTarget, event.clientX, event.clientY),
    )
    const [a, b] = [...pointers.current.values()]
    const [a0, b0] = start.points
    if (b && b0) {
      start.moved = true
      show(pinchView(start.view, [a0, b0], [a, b]))
      return
    }
    const dx = a.x - a0.x
    const dy = a.y - a0.y
    if (Math.hypot(dx, dy) > TAP_SLOP_PX) start.moved = true
    if (start.view.scale > MIN_ZOOM) {
      show({ ...start.view, x: start.view.x + dx, y: start.view.y + dy })
    } else if (several) {
      // Not zoomed: the photo follows the finger until it's let go.
      setView({ ...REST_VIEW, x: dx, smooth: false })
    }
  }

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const start = gesture.current
    if (!start || !pointers.current.delete(event.pointerId)) return
    if (pointers.current.size > 0) {
      restartGesture()
      return
    }
    gesture.current = null
    const point = fromCentre(event.currentTarget, event.clientX, event.clientY)
    if (start.view.scale <= MIN_ZOOM && start.points.length === 1) {
      const dx = point.x - start.points[0].x
      const dy = point.y - start.points[0].y
      if (several && Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1)
        return
      }
      show(REST_VIEW, true)
    }
    if (!start.moved && event.type === 'pointerup') tap(point, event.timeStamp)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!several) return
    if (event.key === 'ArrowLeft') go(-1)
    else if (event.key === 'ArrowRight') go(1)
    else return
    event.preventDefault()
  }

  return (
    <Box ref={rootRef} position="absolute" inset={0} onKeyDown={onKeyDown}>
      <DialogTitle srOnly>{t.title}</DialogTitle>

      <Flex
        ref={stageRef}
        position="absolute"
        inset={0}
        align="center"
        justify="center"
        overflow="hidden"
        px={{ base: 2, md: 20 }}
        py={{ base: 16, md: 20 }}
        touchAction="none"
        userSelect="none"
        cursor={view.scale > MIN_ZOOM ? 'grab' : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {broken ? (
          <Stack align="center" gap={2} color="text.onInvertedMuted">
            <LuImageOff size={40} aria-hidden />
            <Text fontSize="sm" fontWeight={500}>
              {t.unavailable}
            </Text>
          </Stack>
        ) : (
          <Image
            key={index}
            ref={photoRef}
            src={item.src}
            alt={item.alt}
            draggable={false}
            maxW="full"
            maxH="full"
            objectFit="contain"
            // Inline: these change on every frame of a gesture.
            style={{
              transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
              transition: view.smooth
                ? `transform ${sdlMotion.duration.moderate} ${sdlMotion.easing.standard}`
                : 'none',
            }}
            _motionReduce={{ transition: 'none !important' }}
            onError={() => setBrokenSrc(item.src)}
          />
        )}
      </Flex>

      {several ? (
        <Flex
          position="absolute"
          top={{ base: 3, md: 4 }}
          insetStart={{ base: 3, md: 4 }}
          h="44px"
          px={4}
          align="center"
          borderRadius="full"
          bg="bg.invertedRaised"
          color="text.onInverted"
          fontSize="sm"
          fontWeight={600}
          fontVariantNumeric="tabular-nums"
          aria-live="polite"
        >
          {formatMessage(t.counter, {
            current: index + 1,
            total: items.length,
          })}
        </Flex>
      ) : null}

      <DialogCloseTrigger asChild>
        <IconButton
          aria-label={t.close}
          position="absolute"
          top={{ base: 3, md: 4 }}
          insetEnd={{ base: 3, md: 4 }}
          {...controlProps}
        >
          <LuX size={20} strokeWidth={2} aria-hidden />
        </IconButton>
      </DialogCloseTrigger>

      {several ? (
        <>
          <Flex
            position="absolute"
            insetY={0}
            insetStart={{ base: 2, md: 4 }}
            align="center"
            pointerEvents="none"
          >
            <IconButton
              aria-label={t.previous}
              onClick={() => go(-1)}
              {...controlProps}
            >
              <LuChevronLeft size={24} aria-hidden />
            </IconButton>
          </Flex>
          <Flex
            position="absolute"
            insetY={0}
            insetEnd={{ base: 2, md: 4 }}
            align="center"
            pointerEvents="none"
          >
            <IconButton
              aria-label={t.next}
              onClick={() => go(1)}
              {...controlProps}
            >
              <LuChevronRight size={24} aria-hidden />
            </IconButton>
          </Flex>
        </>
      ) : null}

      {/* aria-disabled, not disabled, so a focused button keeps focus at a limit. */}
      <HStack
        position="absolute"
        bottom={{ base: 4, md: 6 }}
        insetX={0}
        justify="center"
        gap={3}
        pointerEvents="none"
      >
        <IconButton
          aria-label={t.zoomOut}
          aria-disabled={broken || view.scale <= MIN_ZOOM || undefined}
          onClick={() => zoomBy(-ZOOM_STEP)}
          {...controlProps}
        >
          <LuZoomOut size={20} aria-hidden />
        </IconButton>
        <IconButton
          aria-label={t.zoomIn}
          aria-disabled={broken || view.scale >= MAX_ZOOM || undefined}
          onClick={() => zoomBy(ZOOM_STEP)}
          {...controlProps}
        >
          <LuZoomIn size={20} aria-hidden />
        </IconButton>
      </HStack>
    </Box>
  )
}

export function ImagePreview({
  items,
  index,
  onIndexChange,
  onClose,
}: ImagePreviewProps) {
  const isBrowser = useIsBrowser()
  const open = index != null && items[index] != null
  // Keep the last photo on screen while the close animation plays.
  const [shown, setShown] = useState(index)
  if (open && index !== shown) setShown(index)

  const overlay = (
    <>
      {/* Blur the page, then a dark scrim (mode-independent ink) so the
          photo and its controls hold contrast on any page, in both themes.
          Not `bg.inverted`: Chakra's own black/white value wins for that name. */}
      <DialogBackdrop
        bg="bg.invertedSurface/85"
        backdropFilter="blur(12px)"
        position="fixed"
        inset="0"
        zIndex={APP_OVERLAY_Z_INDEX}
      />
      <DialogPositioner position="fixed" inset="0" zIndex={APP_OVERLAY_Z_INDEX}>
        <DialogContent bg="transparent" boxShadow="none" w="100dvw" h="100dvh">
          {shown != null && items[shown] ? (
            <PreviewBody
              items={items}
              index={shown}
              onIndexChange={onIndexChange}
            />
          ) : null}
        </DialogContent>
      </DialogPositioner>
    </>
  )

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details: { open: boolean }) => {
        if (!details.open) onClose()
      }}
      size="full"
      motionPreset="scale"
      lazyMount
      unmountOnExit
    >
      {isBrowser ? createPortal(overlay, document.body) : overlay}
    </DialogRoot>
  )
}

'use client'

import { Box, Spinner, Text, chakra } from '@chakra-ui/react'
import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { LuArrowRight, LuCheck } from 'react-icons/lu'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

const THUMB_PX = 48
const TRACK_PAD_PX = 4
/** Share of the track the thumb must cross before release confirms. */
const CONFIRM_AT = 0.85
/** How long a single tap stays armed before resetting. */
const ARMED_MS = 4000

export type SlideToConfirmProps = {
  /** Track label and the button's accessible name, e.g. "Slide to mark Done". */
  label: string
  /** Shown after a tap or Enter: the single-pointer alternative to sliding. */
  armedLabel: string
  onConfirm: () => void
  disabled?: boolean
  loading?: boolean
}

/**
 * Slide-to-confirm for consequential actions (marking a job Done). Dragging
 * the thumb to the end confirms. A tap or Enter arms it and a second tap or
 * Enter confirms, so it works without a drag (WCAG 2.5.1) and from the
 * keyboard.
 */
export function SlideToConfirm({
  label,
  armedLabel,
  onConfirm,
  disabled = false,
  loading = false,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; moved: boolean } | null>(null)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [armed, setArmed] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const inert = disabled || loading || confirmed

  useEffect(() => {
    if (!armed) return
    const timer = window.setTimeout(() => setArmed(false), ARMED_MS)
    return () => window.clearTimeout(timer)
  }, [armed])

  // A finished action leaves the control; reset if it stays mounted.
  useEffect(() => {
    if (!loading && confirmed) {
      setConfirmed(false)
      setOffset(0)
    }
  }, [loading, confirmed])

  const maxOffset = () =>
    Math.max(
      0,
      (trackRef.current?.offsetWidth ?? 0) - THUMB_PX - TRACK_PAD_PX * 2,
    )

  const confirm = () => {
    setArmed(false)
    setConfirmed(true)
    setOffset(maxOffset())
    onConfirm()
  }

  const tap = () => {
    if (inert) return
    if (armed) {
      confirm()
      return
    }
    setArmed(true)
  }

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (inert) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { startX: event.clientX - offset, moved: false }
    setDragging(true)
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const next = Math.min(maxOffset(), Math.max(0, event.clientX - drag.startX))
    if (Math.abs(next - offset) > 4) drag.moved = true
    setOffset(next)
  }

  const onPointerUp = () => {
    const drag = dragRef.current
    dragRef.current = null
    setDragging(false)
    if (!drag) return
    if (!drag.moved) {
      tap()
      return
    }
    const max = maxOffset()
    if (max > 0 && offset >= max * CONFIRM_AT) {
      confirm()
    } else {
      setArmed(false)
      setOffset(0)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    tap()
  }

  const currentLabel = armed ? armedLabel : label

  return (
    <Box
      ref={trackRef}
      position="relative"
      h={`${THUMB_PX + TRACK_PAD_PX * 2}px`}
      w="full"
      borderRadius="full"
      bg="status.success.soft"
      borderWidth={armed ? '2px' : '1px'}
      borderColor={armed ? 'accent.active' : 'border.default'}
      opacity={disabled ? 0.5 : 1}
      userSelect="none"
      overflow="hidden"
    >
      <Text
        position="absolute"
        inset={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        pl={`${THUMB_PX}px`}
        pr={4}
        fontSize="sm"
        fontWeight={500}
        color="status.success.fg"
        textAlign="center"
        pointerEvents="none"
        aria-hidden
      >
        {currentLabel}
      </Text>
      <chakra.button
        type="button"
        aria-label={currentLabel}
        aria-disabled={inert || undefined}
        disabled={disabled}
        position="absolute"
        top={`${TRACK_PAD_PX}px`}
        left={`${TRACK_PAD_PX}px`}
        w={`${THUMB_PX}px`}
        h={`${THUMB_PX}px`}
        borderRadius="full"
        bg="action.primary"
        color="text.onGreen"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor={inert ? 'default' : 'grab'}
        touchAction="none"
        boxShadow="e2"
        style={{ transform: `translateX(${offset}px)` }}
        transitionProperty={dragging ? 'none' : 'transform'}
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
        _focusVisible={sdlFocusRing}
        css={{
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : confirmed ? (
          <LuCheck size={20} aria-hidden />
        ) : (
          <LuArrowRight size={20} aria-hidden />
        )}
      </chakra.button>
      <Box as="span" srOnly aria-live="polite">
        {armed ? armedLabel : ''}
      </Box>
    </Box>
  )
}

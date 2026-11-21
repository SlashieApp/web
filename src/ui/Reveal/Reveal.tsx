'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import { sdlMotion } from '@/theme/styles'

/** `sdlMotion.duration.moderate`, in ms: how long a reveal takes. */
export const REVEAL_MS = 200
/** How far the content travels as it arrives: from under what revealed it. */
const REVEAL_RISE = '-6px'

export type RevealProps = Omit<BoxProps, 'children'> & {
  /** Shown or folded away. Folded content is removed once it has closed. */
  open: boolean
  /**
   * Arrives this long after `open` turns true (ms): the second thing an
   * answer reveals follows the first (staggering). Closing never waits.
   */
  delayMs?: number
  /**
   * Space above the content, inside the fold, so it opens and closes with
   * it. A parent `gap` would jump in the moment the content mounts.
   */
  spaceAbove?: BoxProps['pt']
  children: ReactNode
}

/**
 * Progressive disclosure, in motion: a field that only matters after an
 * answer slides open under it and pushes what follows down, in place of
 * popping in (Post a task motion; Ryan 22 Nov).
 *
 * - Origin awareness: the content arrives from the control above it.
 * - Quiet: 200ms, the standard curve, no bounce.
 * - Interruptible: change the answer mid-way and it turns round from where it is.
 * - Reduced motion: no movement, a 150ms fade.
 *
 * The height is the one layout property animated here (the design system
 * otherwise keeps to transform and opacity): what follows has to move, and a
 * jump is worse. Keep it to a few form rows.
 */
export function Reveal({
  open,
  delayMs = 0,
  spaceAbove,
  children,
  ...rest
}: RevealProps) {
  // `mounted`: in the tree. `shown`: at its open size. `settled`: open and at
  // rest, so nothing (a focus ring, a menu) is clipped any more.
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(open)
  const [settled, setSettled] = useState(open)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (open) {
      setMounted(true)
      // Two frames: the closed size paints before the open one is asked for.
      let second = 0
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setShown(true))
      })
      timer.current = setTimeout(
        () => setSettled(true),
        REVEAL_MS + delayMs + 50,
      )
      return () => {
        cancelAnimationFrame(first)
        cancelAnimationFrame(second)
      }
    }
    setSettled(false)
    setShown(false)
    timer.current = setTimeout(() => setMounted(false), REVEAL_MS + 20)
    return undefined
  }, [open, delayMs])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  if (!mounted) return null

  const arriving = shown && delayMs > 0 && !settled
  return (
    <Box
      data-reveal={shown ? 'open' : 'closed'}
      // Leaving content can't be reached or read out.
      inert={!open}
      display="grid"
      w="full"
      gridTemplateRows={shown ? '1fr' : '0fr'}
      opacity={shown ? 1 : 0}
      transitionProperty="grid-template-rows, opacity"
      transitionDuration={sdlMotion.duration.moderate}
      transitionTimingFunction={sdlMotion.easing.standard}
      transitionDelay={arriving ? `${delayMs}ms` : '0ms'}
      css={{
        '@media (prefers-reduced-motion: reduce)': {
          transitionProperty: 'opacity',
          transitionDuration: sdlMotion.duration.base,
        },
      }}
      {...rest}
    >
      <Box
        minH={0}
        minW={0}
        // Clipped top and bottom only while it moves; never at the sides,
        // where a focus ring sits.
        overflowY={settled ? 'visible' : 'clip'}
        pt={spaceAbove}
        transform={shown ? 'none' : `translateY(${REVEAL_RISE})`}
        transitionProperty="transform"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.decelerate}
        transitionDelay={arriving ? `${delayMs}ms` : '0ms'}
        css={{
          '@media (prefers-reduced-motion: reduce)': {
            transform: 'none',
            transitionProperty: 'none',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

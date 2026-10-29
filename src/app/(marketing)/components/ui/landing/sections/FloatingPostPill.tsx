'use client'

import { Box, type SystemStyleObject } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { LuArrowRight } from 'react-icons/lu'

import { COOKIE_BANNER_HEIGHT_VAR } from '@/app/cookieBannerLayout'
import { sdlMotion } from '@/theme/styles'
import { Button } from '@ui'

import {
  FLOATING_PILL_HERO,
  FLOATING_PILL_HIDE_WHILE,
  watchFloatingPill,
} from './floatingPillWatch'

/** How far the pill rises while it fades in (none under reduced motion). */
export const FLOATING_PILL_RISE_PX = 16
/** The gap between the pill and the bottom of the screen (or the banner). */
export const FLOATING_PILL_GAP_PX = 16

const ENTER_MS = 400
const EXIT_MS = 200

/**
 * Above the bottom edge by the gap, and above whatever sits there: the phone's
 * safe area (home indicator) or the open cookie banner, whichever is taller.
 * The banner publishes its height on `<html>` (`cookieBannerLayout`).
 */
const BOTTOM = `calc(max(env(safe-area-inset-bottom, 0px), var(${COOKIE_BANNER_HEIGHT_VAR}, 0px)) + ${FLOATING_PILL_GAP_PX}px)`

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  )
}

/**
 * Hidden, the pill is out of the tab order and the accessibility tree
 * (`visibility`, which waits for the fade-out), so a keyboard never lands on
 * something nobody can see. Shown, it fades in and rises 16px over 400ms on
 * the decelerate curve; reduced motion fades without the rise. It stays shown
 * while it holds focus, so scrolling on never pulls it from under the keyboard.
 */
function motionCss(reduced: boolean): SystemStyleObject {
  const out = (property: string) =>
    `${property} ${EXIT_MS}ms ${sdlMotion.easing.standard}`
  const into = (property: string, ms: number) =>
    `${property} ${ms}ms ${sdlMotion.easing.decelerate}`

  return {
    visibility: 'hidden',
    opacity: 0,
    transform: reduced ? 'none' : `translateY(${FLOATING_PILL_RISE_PX}px)`,
    transition: [
      out('opacity'),
      ...(reduced ? [] : [out('transform')]),
      `visibility 0s linear ${EXIT_MS}ms`,
    ].join(', '),
    '&[data-visible="true"], &:focus-within': {
      visibility: 'visible',
      opacity: 1,
      transform: 'none',
      transition: reduced
        ? into('opacity', EXIT_MS)
        : [into('opacity', ENTER_MS), into('transform', ENTER_MS)].join(', '),
    },
    '@media print': { display: 'none' },
  }
}

export type FloatingPostPillProps = {
  /** The label: today's "Post a task". */
  label: string
  /** Where the page's post action goes (localized). */
  href: string
  /** Selector of the hero; the pill shows once it has scrolled out of view. */
  hero?: string
  /** Selector list of the blocks that hide the pill while any is in view. */
  hideWhile?: string
}

/**
 * The floating "Post a task" pill (tone refresh, train 2, item 8): an ink pill
 * fixed to the bottom centre of the screen with the page's post label and an
 * arrow, linking to where the page's post action goes. It shows once the hero
 * is out of view and hides while the final call to action or the footer is in
 * view (both offer the same action), and it never covers the cookie banner:
 * it sits above it. No counters, no social proof.
 *
 * It is one link named by its label (the arrow is decorative), in the tab
 * order while shown. Ink is `text.default` with a `bg.surface` label, the pair
 * the app already uses for an ink fill, so it reads in both themes; green stays
 * with the page's main actions. Motion: a 16px rise with the fade, none under
 * reduced motion (it just fades). The server renders it hidden; the visitor's
 * scroll shows it.
 */
export function FloatingPostPill({
  label,
  href,
  hero = FLOATING_PILL_HERO,
  hideWhile = FLOATING_PILL_HIDE_WHILE,
}: FloatingPostPillProps) {
  const [shown, setShown] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  // Watches the page's own blocks, which live elsewhere in the document; the
  // ref callback's setup runs once on mount and its cleanup on unmount.
  const watch = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return
      return watchFloatingPill({ hero, hideWhile, onChange: setShown })
    },
    [hero, hideWhile],
  )

  return (
    <Box
      ref={watch}
      data-floating-post-pill=""
      data-visible={shown ? 'true' : 'false'}
      position="fixed"
      insetInline={0}
      bottom={BOTTOM}
      zIndex={2}
      display="flex"
      justifyContent="center"
      // The row spans the screen; only the pill itself takes the pointer.
      pointerEvents="none"
      css={motionCss(reducedMotion)}
    >
      <Button
        asChild
        size="md"
        variant="primary"
        px={5}
        bg="text.default"
        color="bg.surface"
        boxShadow="e3"
        whiteSpace="nowrap"
        _hover={{ bg: 'text.muted' }}
        _active={{ bg: 'text.default' }}
      >
        <NextLink href={href}>
          {label}
          <LuArrowRight size={18} aria-hidden />
        </NextLink>
      </Button>
    </Box>
  )
}

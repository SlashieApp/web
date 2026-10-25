'use client'

import {
  Box,
  type BoxProps,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { LuArrowLeft } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { findScrollParent } from '@/utils/findScrollParent'

import { IconButton } from '../IconButton/IconButton'

export type StickyHeaderProps = {
  title: string
  description?: ReactNode
  /** Shows the back control when set. */
  onBack?: () => void
  /** Accessible label for the icon back button (it has no visible text). */
  backAriaLabel?: string
  /** Hide the back controls from this breakpoint up (the app header covers it). */
  hideBackFrom?: 'md' | 'lg'
  /** Primary action pinned to the right. Receives `isStuck` to compact itself. */
  action?: ReactNode | ((ctx: { isStuck: boolean }) => ReactNode)
  /**
   * `compact` (default): the title block sticks and shrinks. `largeTitle`:
   * the iPhone title bar (FE-420): a sticky bar with the back control and a
   * small title that fades in once the large title in the page has scrolled
   * under it. `inlineTitle`: the same bar with its title always showing, for
   * a page that draws its own heading. `hideBackFrom` and `action` are for
   * `compact` only; the bar shows Back at every width.
   */
  variant?: 'compact' | 'largeTitle' | 'inlineTitle'
  /** Bar variants: where the bar sticks when a sticky header sits above it. */
  stickyTop?: BoxProps['top']
  /** Bar variants: the width of the bar's row and of the large title, left aligned. */
  contentMaxW?: BoxProps['maxW']
}

const MOTION = {
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

/**
 * Page header that sticks to the top of the scroll pane. Open: back link,
 * large title, description, action aligned to the block's end. Once stuck
 * it compacts: white full-bleed bar, icon back button inline with a smaller
 * title, action centred on the right. The scroll pane should clip x-overflow
 * (the app shell `main` does) so the full-bleed bar adds no scrollbar.
 *
 * The `largeTitle` and `inlineTitle` variants are the app's iPhone title bar
 * instead (see `TitleBarHeader`).
 */
export function StickyHeader({
  variant = 'compact',
  stickyTop,
  contentMaxW,
  ...props
}: StickyHeaderProps) {
  if (variant === 'compact') return <CompactHeader {...props} />
  return (
    <TitleBarHeader
      {...props}
      large={variant === 'largeTitle'}
      stickyTop={stickyTop}
      contentMaxW={contentMaxW}
    />
  )
}

function CompactHeader({
  title,
  description,
  onBack,
  backAriaLabel,
  hideBackFrom,
  action,
}: Omit<StickyHeaderProps, 'variant' | 'stickyTop' | 'contentMaxW'>) {
  const [isStuck, setIsStuck] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect()
    observerRef.current = null
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { root: findScrollParent(node), threshold: 0 },
    )
    observer.observe(node)
    observerRef.current = observer
  }, [])

  const actionNode = typeof action === 'function' ? action({ isStuck }) : action
  const backDisplay = hideBackFrom
    ? { base: 'inline-flex', [hideBackFrom]: 'none' }
    : undefined

  return (
    <>
      <Box ref={sentinelRef} h="1px" w="full" aria-hidden />
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        w="full"
        py={isStuck ? 3 : { base: 4, md: 6 }}
        transitionProperty="padding"
        {...MOTION}
        data-stuck={isStuck ? '' : undefined}
      >
        <Box
          aria-hidden
          position="absolute"
          top={0}
          bottom={0}
          left="50%"
          w="100vw"
          transform="translateX(-50%)"
          bg="bg.surface"
          borderBottomWidth="1px"
          borderColor="border.default"
          opacity={isStuck ? 1 : 0}
          pointerEvents="none"
          transitionProperty="opacity"
          {...MOTION}
        />
        <HStack
          position="relative"
          gap={4}
          w="full"
          minW={0}
          align={isStuck ? 'center' : 'flex-end'}
          justify="space-between"
        >
          <Stack gap={isStuck ? 0 : 2} flex="1 1 auto" minW={0}>
            {onBack && !isStuck ? (
              <IconButton
                type="button"
                variant="ghost"
                aria-label={backAriaLabel ?? 'Back'}
                display={backDisplay}
                alignSelf="flex-start"
                ml={-2}
                color="text.muted"
                onClick={onBack}
              >
                <LuArrowLeft />
              </IconButton>
            ) : null}
            <HStack gap={2} minW={0} align="center">
              {onBack && isStuck ? (
                <IconButton
                  type="button"
                  variant="ghost"
                  aria-label={backAriaLabel ?? 'Back'}
                  display={backDisplay}
                  flexShrink={0}
                  ml={-2}
                  onClick={onBack}
                >
                  <LuArrowLeft />
                </IconButton>
              ) : null}
              <Heading
                as="h1"
                minW={0}
                fontFamily="heading"
                fontSize={
                  isStuck
                    ? { base: 'md', md: 'lg' }
                    : { base: '2xl', md: '3xl' }
                }
                fontWeight={isStuck ? 600 : 700}
                lineHeight={isStuck ? '1.3' : '1.15'}
                color="text.default"
                truncate={isStuck}
                transitionProperty="font-size, font-weight, line-height"
                {...MOTION}
              >
                {title}
              </Heading>
            </HStack>
            {isStuck || !description ? null : (
              <Text fontSize="sm" color="text.muted" maxW="3xl">
                {description}
              </Text>
            )}
          </Stack>
          {actionNode ? <Box flexShrink={0}>{actionNode}</Box> : null}
        </HStack>
      </Box>
    </>
  )
}

/** The bar's height: iOS's 44pt navigation bar, and the 44px touch target. */
const BAR_H = '44px'

/** iOS's large title is 34pt bold. */
const LARGE_TITLE_SIZE = '34px'

const BAR_TITLE_FADE_CSS = {
  transitionProperty: 'opacity',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
  '@media (prefers-reduced-motion: reduce)': {
    transitionDuration: '0ms',
  },
} as const

/**
 * The iPhone title bar (FE-420), at every width, as the app's native header
 * draws it (`headerLargeTitle`): a bar that sticks with the icon-only Back on
 * the left and the small title centred. `largeTitle` also draws the page's
 * one h1 under the bar; it scrolls up beneath the bar, and once it has gone
 * the small title fades in. The small title is `aria-hidden` while the large
 * one shows, so a screen reader hears the title once. `inlineTitle` has no
 * large title (the page brings its own heading), so the small one always
 * shows. The bar is the page's own colour with no rule under it, as in the
 * app. It scrolls with the page, so it must sit in a column as tall as the
 * page for `position: sticky` to hold.
 */
function TitleBarHeader({
  title,
  description,
  onBack,
  backAriaLabel,
  large,
  stickyTop = 0,
  contentMaxW,
}: Omit<StickyHeaderProps, 'variant' | 'hideBackFrom' | 'action'> & {
  large: boolean
}) {
  const barRef = useRef<HTMLDivElement>(null)
  const detachRef = useRef<(() => void) | null>(null)
  const [largeTitleShows, setLargeTitleShows] = useState(true)

  // The large title has gone once its bottom edge is under the bar's. Both
  // edges are read from the page, so a bar that sticks lower (below the
  // marketing header) needs no offset here.
  const titleRef = useCallback((node: HTMLHeadingElement | null) => {
    detachRef.current?.()
    detachRef.current = null
    if (!node) return
    const scroller: HTMLElement | Window = findScrollParent(node) ?? window
    const update = () => {
      const bar = barRef.current
      if (!bar) return
      setLargeTitleShows(
        node.getBoundingClientRect().bottom >
          bar.getBoundingClientRect().bottom,
      )
    }
    update()
    scroller.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    detachRef.current = () => {
      scroller.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const smallTitleShows = !large || !largeTitleShows

  return (
    <>
      <Box
        ref={barRef}
        position="sticky"
        top={stickyTop}
        zIndex={10}
        w="full"
        h={BAR_H}
      >
        <Box
          aria-hidden
          position="absolute"
          top={0}
          bottom={0}
          left="50%"
          w="100vw"
          transform="translateX(-50%)"
          bg="bg.subtle"
          pointerEvents="none"
        />
        <Box position="relative" h="full" maxW={contentMaxW}>
          {onBack ? (
            <IconButton
              type="button"
              variant="ghost"
              aria-label={backAriaLabel ?? 'Back'}
              color="text.default"
              ml={-2}
              onClick={onBack}
            >
              <LuArrowLeft />
            </IconButton>
          ) : null}
          <Box
            aria-hidden={smallTitleShows ? undefined : true}
            position="absolute"
            inset={0}
            px={BAR_H}
            display="flex"
            alignItems="center"
            justifyContent="center"
            pointerEvents="none"
            opacity={smallTitleShows ? 1 : 0}
            css={BAR_TITLE_FADE_CSS}
          >
            <Text
              fontFamily="heading"
              fontSize="17px"
              fontWeight={600}
              lineHeight="1.3"
              color="text.default"
              truncate
            >
              {title}
            </Text>
          </Box>
        </Box>
      </Box>
      {large ? (
        <Stack gap={2} pt={1} pb={{ base: 4, md: 6 }} maxW={contentMaxW}>
          <Heading
            ref={titleRef}
            as="h1"
            fontFamily="heading"
            fontSize={LARGE_TITLE_SIZE}
            fontWeight={700}
            lineHeight="1.2"
            color="text.default"
          >
            {title}
          </Heading>
          {description ? (
            <Text fontSize="sm" color="text.muted" maxW="3xl">
              {description}
            </Text>
          ) : null}
        </Stack>
      ) : null}
    </>
  )
}

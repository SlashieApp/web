'use client'

import type { BoxProps } from '@chakra-ui/react'
import { Box, Grid, HStack, Stack } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useCallback, useRef, useState } from 'react'

import {
  COMPACT_DETAIL_HERO_H,
  MAP_FADE_BOTTOM,
} from '@/app/(task)/helpers/marketplaceMap'
import { WEB_MIN_PX } from '@/theme/breakpoints'
import { findScrollParent } from '@/utils/findScrollParent'
import { MOBILE_BOTTOM_NAV_MAX_W, Tabs } from '@ui'

import { TASK_DETAIL_STUCK_TOP_PADDING } from '../../helpers/taskDetailHeaderCollapse'
import { TASK_DETAIL_TAB_BODY_MIN_H } from '../../helpers/taskDetailLayout'
import type { TaskDetailTab } from '../../helpers/taskDetailTabs'

export type TaskDetailTabSlot = {
  key: TaskDetailTab
  label: string
  badge?: number
  cards: ReactNode
}

export type TaskDetailTabLayoutProps = {
  title: ReactNode | ((ctx: { isStuck: boolean }) => ReactNode)
  tabs: TaskDetailTabSlot[]
  value: TaskDetailTab
  onChange: (key: TaskDetailTab) => void
  ariaLabel: string
  fitted?: boolean
  fittedBelowLg?: boolean
  px?: BoxProps['px']
  /** Desktop right rail (Help & actions, Analytics, Activity). Hidden below `lg`. */
  rail?: ReactNode
  /** Desktop main CTA, in the title row at the right, bottom-aligned. Hidden below `lg`. */
  mainCta?: ReactNode
  /** The desktop CTA is a lone button: size it to its content, not half the row. */
  mainCtaFit?: boolean
}

const COMPACT_MAX_PX = WEB_MIN_PX - 1

/**
 * Web main CTA: half the row (wider than the 1/3 rail cards), capped at the
 * floating nav width.
 */
const WEB_MAIN_CTA_W = `min(${MOBILE_BOTTOM_NAV_MAX_W}, calc((100% - 1.5rem) / 2))`

/**
 * Compact (phone + tablet) wash sits on the sticky title/tab chrome and
 * fades up into the map — not on the Mapbox canvas.
 */
const COMPACT_HEADER_FADE_CSS = {
  isolation: 'isolate',
  overflow: 'visible',
  '& > *:not([data-task-detail-stuck-bg])': {
    position: 'relative',
    zIndex: 1,
  },
  [`@media screen and (max-width: ${COMPACT_MAX_PX}px)`]: {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '50%',
      width: '100vw',
      transform: 'translateX(-50%)',
      bottom: 0,
      height: COMPACT_DETAIL_HERO_H.base,
      backgroundImage: MAP_FADE_BOTTOM,
      pointerEvents: 'none',
      zIndex: -2,
    },
  },
  [`@media screen and (min-width: 768px) and (max-width: ${COMPACT_MAX_PX}px)`]:
    {
      '&::before': {
        height: COMPACT_DETAIL_HERO_H.md,
      },
    },
} as const

const STUCK_SURFACE = 'var(--chakra-colors-bg-surface, #FFFFFF)'

function StuckHeaderBg({ isStuck }: { isStuck: boolean }) {
  const reducedMotion = useReducedMotion() ?? false

  return (
    <motion.div
      aria-hidden
      data-task-detail-stuck-bg
      initial={false}
      animate={{ opacity: isStuck ? 1 : 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.2,
        ease: [0.2, 0, 0, 1],
      }}
      style={{
        position: 'absolute',
        top: `-${TASK_DETAIL_STUCK_TOP_PADDING}`,
        bottom: 0,
        left: '50%',
        width: '100vw',
        transform: 'translateX(-50%)',
        background: STUCK_SURFACE,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

/**
 * Task-detail tab chrome: sticky title + tab headers with the web main CTA at
 * the right of the title row (bottom edges aligned), then the cards and the
 * desktop rail sharing a top edge in the 2:1 grid. The compact pin lives in
 * TaskDetailMainCta.
 */
export function TaskDetailTabLayout({
  title,
  tabs,
  value,
  onChange,
  ariaLabel,
  fitted = false,
  fittedBelowLg = false,
  px,
  rail,
  mainCta,
  mainCtaFit = false,
}: TaskDetailTabLayoutProps) {
  const [isStuck, setIsStuck] = useState(false)
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null)

  const stickySentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelObserverRef.current?.disconnect()
    sentinelObserverRef.current = null
    if (!node) {
      document.documentElement.removeAttribute('data-task-detail-stuck')
      return
    }
    const scroller = findScrollParent(node)
    const observer = new IntersectionObserver(
      ([entry]) => {
        const stuck = !entry.isIntersecting
        setIsStuck(stuck)
        document.documentElement.toggleAttribute(
          'data-task-detail-stuck',
          stuck,
        )
      },
      {
        root: scroller,
        threshold: 0,
        rootMargin: '0px',
      },
    )
    observer.observe(node)
    sentinelObserverRef.current = observer
  }, [])

  const titleNode = typeof title === 'function' ? title({ isStuck }) : title
  const splitColumns = rail
    ? { base: '1fr', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }
    : '1fr'

  return (
    <>
      <Box ref={stickySentinelRef} h="1px" w="full" aria-hidden />
      <Tabs
        fitted={fitted}
        fittedBelowLg={fittedBelowLg}
        sticky
        stickyTop={`-${TASK_DETAIL_STUCK_TOP_PADDING}`}
        stickyBg="transparent"
        stickyChromeProps={{
          borderTopRadius: 0,
          css: COMPACT_HEADER_FADE_CSS,
        }}
        panelBg={{ base: 'bg.canvas', lg: 'transparent' }}
        fadeTabListBorder
        hideTabList={tabs.length < 2}
        w="full"
        px={px}
        aria-label={ariaLabel}
        value={value}
        onChange={(key) => {
          const next = tabs.find((tab) => tab.key === key)
          if (next) onChange(next.key)
        }}
        stickyHeader={
          <>
            <StuckHeaderBg isStuck={isStuck} />
            {mainCta ? (
              <HStack align="flex-end" gap={6} w="full">
                <Box flex="1" minW={0}>
                  {titleNode}
                </Box>
                {/* Bottom padding matches the title block, so the CTA lines up with the chips. */}
                <Box
                  display={{ base: 'none', lg: 'block' }}
                  w={mainCtaFit ? 'auto' : WEB_MAIN_CTA_W}
                  flexShrink={0}
                  pb={4}
                  pointerEvents="auto"
                >
                  {mainCta}
                </Box>
              </HStack>
            ) : (
              titleNode
            )}
          </>
        }
        tabs={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          badge: tab.badge,
        }))}
      >
        <Stack gap={5} w="full" pt={5} pb={6}>
          <Grid
            templateColumns={splitColumns}
            columnGap={6}
            alignItems="start"
            w="full"
          >
            <Box minW={0}>
              {tabs.map((tab) => (
                <Tabs.Panel key={tab.key} value={tab.key} pt={0} pb={0}>
                  <Stack
                    gap={5}
                    w="full"
                    minW={0}
                    minH={TASK_DETAIL_TAB_BODY_MIN_H}
                    pointerEvents="auto"
                  >
                    {tab.cards}
                  </Stack>
                </Tabs.Panel>
              ))}
            </Box>
            {rail ? (
              <Box
                display={{ base: 'none', lg: 'block' }}
                minW={0}
                pointerEvents="auto"
              >
                {rail}
              </Box>
            ) : null}
          </Grid>
        </Stack>
      </Tabs>
    </>
  )
}

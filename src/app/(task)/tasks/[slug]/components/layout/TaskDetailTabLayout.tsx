'use client'

import type { BoxProps } from '@chakra-ui/react'
import { Box, Stack } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { type ReactNode, useCallback, useRef, useState } from 'react'

import {
  COMPACT_DETAIL_HERO_H,
  MAP_FADE_BOTTOM,
} from '@/app/(task)/helpers/marketplaceMap'
import { WEB_MIN_PX } from '@/theme/breakpoints'
import { Tabs } from '@ui'

import { findScrollParent } from '../../helpers/taskDetailHeaderCollapse'
import {
  TASK_DETAIL_STICKY_SNAP_OFFSET_PX,
  TASK_DETAIL_TAB_BODY_MIN_H,
} from '../../helpers/taskDetailLayout'
import type { TaskDetailTab } from '../../helpers/taskDetailTabs'

export type TaskDetailTabSlot = {
  key: TaskDetailTab
  label: string
  badge?: number
  tabTitle?: ReactNode
  tabDescription?: ReactNode
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
}

const COMPACT_MAX_PX = WEB_MIN_PX - 1

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
        top: 0,
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

function TabIntro({
  tabTitle,
  tabDescription,
}: Pick<TaskDetailTabSlot, 'tabTitle' | 'tabDescription'>) {
  if (!tabTitle && !tabDescription) return null

  return (
    <Stack gap={1} w="full" minW={0}>
      {tabTitle ? (
        <Box
          as="h2"
          fontWeight={700}
          fontSize="lg"
          color="text.default"
          lineHeight="short"
        >
          {tabTitle}
        </Box>
      ) : null}
      {tabDescription ? (
        <Box fontSize="sm" color="text.muted" lineHeight="short">
          {tabDescription}
        </Box>
      ) : null}
    </Stack>
  )
}

/**
 * Task-detail tab chrome: sticky title + tab headers, then per-tab
 * title/description and section cards. The mobile pin lives on the page.
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
}: TaskDetailTabLayoutProps) {
  const [isStuck, setIsStuck] = useState(false)
  const sentinelObserverRef = useRef<IntersectionObserver | null>(null)

  const stickySentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelObserverRef.current?.disconnect()
    sentinelObserverRef.current = null
    if (!node) return
    const scroller = findScrollParent(node)
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting)
      },
      {
        root: scroller,
        threshold: 0,
        rootMargin: `-${TASK_DETAIL_STICKY_SNAP_OFFSET_PX}px 0px 0px 0px`,
      },
    )
    observer.observe(node)
    sentinelObserverRef.current = observer
  }, [])

  const titleNode = typeof title === 'function' ? title({ isStuck }) : title

  return (
    <>
      <Box ref={stickySentinelRef} h="1px" w="full" aria-hidden />
      <Tabs
        fitted={fitted}
        fittedBelowLg={fittedBelowLg}
        sticky
        stickyTop={0}
        stickyBg="transparent"
        stickyChromeProps={{
          borderTopRadius: 0,
          css: COMPACT_HEADER_FADE_CSS,
        }}
        panelBg={{ base: 'bg.canvas', lg: 'transparent' }}
        fadeTabListBorder
        tabListMaxW={{ base: 'full', lg: '50%' }}
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
            {titleNode}
          </>
        }
        tabs={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          badge: tab.badge,
        }))}
      >
        {tabs.map((tab) => (
          <Tabs.Panel key={tab.key} value={tab.key}>
            <Stack
              gap={5}
              w="full"
              minW={0}
              minH={TASK_DETAIL_TAB_BODY_MIN_H}
              pointerEvents="auto"
            >
              <TabIntro
                tabTitle={tab.tabTitle}
                tabDescription={tab.tabDescription}
              />
              {tab.cards}
            </Stack>
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  )
}

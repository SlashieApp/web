'use client'

import type { BoxProps } from '@chakra-ui/react'
import { Box, HStack, Stack } from '@chakra-ui/react'
import { type ReactNode, useCallback, useRef, useState } from 'react'

import { WEB_MQ } from '@/theme/breakpoints'
import { Tabs } from '@ui'

import { findScrollParent } from '../../helpers/taskDetailHeaderCollapse'
import type { TaskDetailTab } from '../../helpers/taskDetailTabs'
import { Reveal } from './Reveal'

export type TaskDetailTabSlot = {
  key: TaskDetailTab
  label: string
  badge?: number
  tabTitle?: ReactNode
  tabDescription?: ReactNode
  /** Mobile icon button next to this tab's title. */
  tabIconButton?: ReactNode
  cards: ReactNode
}

export type TaskDetailTabLayoutProps = {
  title: ReactNode | ((ctx: { isStuck: boolean }) => ReactNode)
  tabs: TaskDetailTabSlot[]
  /** Mobile sticky CTA — one overview card relocated to the pin. */
  mainCta?: ReactNode
  value: TaskDetailTab
  onChange: (key: TaskDetailTab) => void
  ariaLabel: string
  fitted?: boolean
  fittedBelowLg?: boolean
  px?: BoxProps['px']
}

const STUCK_SURFACE = 'var(--chakra-colors-bg-surface, #FFFFFF)'

/** Full-width header surface only — map canvas fades handle wash, not the cards. */
const STUCK_CHROME_CSS = {
  isolation: 'isolate',
  overflow: 'visible',
  borderRadius: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: '100vw',
    transform: 'translateX(-50%)',
    background: STUCK_SURFACE,
    pointerEvents: 'none',
    zIndex: -1,
    borderRadius: 0,
  },
} as const

function TabIntro({
  tabTitle,
  tabDescription,
  tabIconButton,
}: Pick<TaskDetailTabSlot, 'tabTitle' | 'tabDescription' | 'tabIconButton'>) {
  if (!tabTitle && !tabDescription && !tabIconButton) return null

  return (
    <HStack align="flex-start" gap={2} w="full">
      <Stack gap={1} flex={1} minW={0}>
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
      {tabIconButton ? (
        <Box display={{ base: 'block', lg: 'none' }} flexShrink={0}>
          {tabIconButton}
        </Box>
      ) : null}
    </HStack>
  )
}

/**
 * Task-detail tab chrome: title + badges, tab headers, per-tab
 * title/description/icon button, section cards, and the mobile sticky CTA.
 */
export function TaskDetailTabLayout({
  title,
  tabs,
  mainCta,
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
      { root: scroller, threshold: 1 },
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
        stickyBg={isStuck ? 'bg.surface' : 'transparent'}
        stickyChromeProps={{
          borderTopRadius: 0,
          css: isStuck ? STUCK_CHROME_CSS : undefined,
        }}
        panelBg={{ base: 'bg.canvas', lg: 'transparent' }}
        fadeTabListBorder
        w="full"
        px={px}
        aria-label={ariaLabel}
        value={value}
        onChange={(key) => {
          const next = tabs.find((tab) => tab.key === key)
          if (next) onChange(next.key)
        }}
        stickyHeader={titleNode}
        tabs={tabs.map((tab) => ({
          key: tab.key,
          label: tab.label,
          badge: tab.badge,
        }))}
      >
        {tabs.map((tab) => (
          <Tabs.Panel key={tab.key} value={tab.key}>
            <Stack gap={5} w="full" minW={0} pointerEvents="auto">
              <TabIntro
                tabTitle={tab.tabTitle}
                tabDescription={tab.tabDescription}
                tabIconButton={tab.tabIconButton}
              />
              {tab.cards}
            </Stack>
          </Tabs.Panel>
        ))}
      </Tabs>
      {mainCta ? (
        <Box
          data-task-detail-main-cta
          css={{
            display: 'block',
            [`@media screen and ${WEB_MQ}`]: { display: 'none' },
          }}
          position="fixed"
          insetX={0}
          bottom={0}
          zIndex={25}
          pointerEvents="none"
          px={3}
          pt={2}
          pb="calc(10px + env(safe-area-inset-bottom, 0px))"
        >
          <Reveal>
            <Box pointerEvents="auto">{mainCta}</Box>
          </Reveal>
        </Box>
      ) : null}
    </>
  )
}

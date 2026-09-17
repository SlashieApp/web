'use client'

import type { BoxProps } from '@chakra-ui/react'
import { Box } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Tabs } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { findScrollParent } from '../../helpers/taskDetailHeaderCollapse'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import bag from '../../i11n.json'
import { TaskDetailMoneyChrome } from './TaskDetailMoneyChrome'
import { TaskInfoSections, TaskQuoteSections } from './TaskDetailSections'

type TaskDetailSectionTabsProps = {
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

/**
 * Shared Overview · Quotes tabs with sticky money chrome.
 * Controlled from TaskDetailProvider so the role CTA can switch tabs.
 */
export function TaskDetailSectionTabs({
  fitted = false,
  fittedBelowLg = false,
  px,
}: TaskDetailSectionTabsProps) {
  const t = useI11n(bag)
  const { task, activeTab, setActiveTab } = useTaskDetail()
  const quoteCount = task?.quotes.length ?? 0
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
        w="full"
        px={px}
        aria-label={t.nav.taskSectionsAria}
        value={activeTab}
        onChange={(key) => {
          if (
            key === TASK_DETAIL_TAB.overview ||
            key === TASK_DETAIL_TAB.quotes
          ) {
            setActiveTab(key)
          }
        }}
        stickyHeader={<TaskDetailMoneyChrome isStuck={isStuck} />}
        tabs={[
          { key: TASK_DETAIL_TAB.overview, label: t.mobile.tabOverview },
          {
            key: TASK_DETAIL_TAB.quotes,
            label: t.mobile.tabQuotes,
            badge: quoteCount,
          },
        ]}
      >
        <Tabs.Panel value={TASK_DETAIL_TAB.overview}>
          <TaskInfoSections />
        </Tabs.Panel>
        <Tabs.Panel value={TASK_DETAIL_TAB.quotes}>
          <TaskQuoteSections />
        </Tabs.Panel>
      </Tabs>
    </>
  )
}

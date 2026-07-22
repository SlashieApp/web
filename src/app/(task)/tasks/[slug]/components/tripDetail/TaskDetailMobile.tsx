'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Skeleton, Stack } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { LuShare2 } from 'react-icons/lu'
import bag from '../../i11n.json'

import { Button, Link, Tabs } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { useScrollContainerCollapsed } from '../../helpers/taskDetailHeaderCollapse'
import { Reveal } from './Reveal'
import { StatusHeader } from './StatusHeader'
import {
  MOBILE_COLLAPSED_HEADER_H,
  TaskDetailMobileCollapsedHeader,
} from './TaskDetailMobileCollapsedHeader'
import { TaskInfoSections, TaskQuoteSections } from './TaskDetailSections'
import { useShareTask } from './openTask/shareTask'

const TAB_INFO = 'info'
const TAB_QUOTES = 'quotes'

function readHashTab(): string | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace('#', '')
  return hash === TAB_INFO || hash === TAB_QUOTES ? hash : null
}

/**
 * Mobile (<lg) task-detail: a pinned hero (status + primary CTA + booking banner)
 * above Info / Quotes tabs. Tab content reuses the same section components as the
 * desktop layout. Presentation only.
 */
export function TaskDetailMobile() {
  const { task, permissions, statusReady } = useTaskDetail()
  const t = useI11n(bag)
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  // Collapse once the map hero has largely scrolled away, resolved from the
  // app-shell content pane (not the window — see taskDetailHeaderCollapse).
  const rootRef = useRef<HTMLDivElement>(null)
  const collapsed = useScrollContainerCollapsed(rootRef, 140, 80)

  const quoteCount = task?.quotes.length ?? 0
  const defaultTab =
    permissions.isOwner && quoteCount > 0 ? TAB_QUOTES : TAB_INFO
  const [activeTab, setActiveTab] = useState(defaultTab)

  useEffect(() => {
    const fromHash = readHashTab()
    if (fromHash) setActiveTab(fromHash)
  }, [])

  const onTabChange = useCallback((key: string) => {
    setActiveTab(key)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${key}`)
    }
  }, [])

  if (!task) return null

  const quoteFlowHref = `/tasks/${task.id}/quote`

  // Pinned primary CTA for OPEN states (booking states use the banner below).
  // Held as a skeleton until the viewer state is confirmed — the CTA choice
  // (share vs quote vs none) is exactly the state that used to flash wrong.
  let heroCta: React.ReactNode = null
  if (!statusReady) {
    heroCta = <Skeleton h="48px" w="full" borderRadius="md" />
  } else if (permissions.isOwner && permissions.isOpen) {
    heroCta = (
      <Button variant="primary" w="full" onClick={() => void onShare()}>
        <LuShare2 />
        {t.mobile.shareTask}
      </Button>
    )
  } else if (permissions.showQuoteForm) {
    heroCta = (
      <Link
        href={quoteFlowHref}
        _hover={{ textDecoration: 'none' }}
        display="block"
      >
        <Button variant="primary" w="full">
          {t.mobile.sendQuote}
        </Button>
      </Link>
    )
  }

  return (
    <Box ref={rootRef} pb={28}>
      {/* Compact header that pins above the tabs once the hero scrolls away. */}
      <TaskDetailMobileCollapsedHeader collapsed={collapsed} />

      {/* Full-bleed map hero — text aligned to the page container internally.
          The map fades out once collapsed so it doesn't linger on scroll. */}
      <StatusHeader collapsed={collapsed} />

      <Stack gap={5} w="full" px={4} pt={4}>
        {heroCta ? <Reveal speed="slow">{heroCta}</Reveal> : null}

        <Tabs
          fitted
          sticky
          stickyTop={collapsed ? MOBILE_COLLAPSED_HEADER_H : 0}
          aria-label={t.nav.taskSectionsAria}
          value={activeTab}
          onChange={onTabChange}
          tabs={[
            { key: TAB_INFO, label: t.mobile.tabInfo },
            { key: TAB_QUOTES, label: t.mobile.tabQuotes, badge: quoteCount },
          ]}
        >
          <Tabs.Panel value={TAB_INFO}>
            <TaskInfoSections />
          </Tabs.Panel>

          <Tabs.Panel value={TAB_QUOTES}>
            <TaskQuoteSections />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  )
}

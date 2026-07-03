'use client'

import type { OrderItem } from '@/utils/orderHelpers'
import { Box, Stack } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { LuShare2 } from 'react-icons/lu'

import { Button, Link, Tabs } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { Reveal } from './Reveal'
import { StatusHeader } from './StatusHeader'
import { BookingSection } from './openTask/BookingSection'
import { HelpActionsCard } from './openTask/HelpActionsCard'
import { LocationCard } from './openTask/LocationCard'
import { PhotosCard } from './openTask/PhotosCard'
import { QuotesPanel } from './openTask/QuotesPanel'
import { TaskDetailsCard } from './openTask/TaskDetailsCard'
import { TrustCard } from './openTask/TrustCard'
import { useShareTask } from './openTask/shareTask'

type TaskDetailMobileProps = {
  order: OrderItem | null | undefined
}

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
export function TaskDetailMobile({ order }: TaskDetailMobileProps) {
  const { task, permissions } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || 'Task')

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
  let heroCta: React.ReactNode = null
  if (permissions.isOwner && permissions.isOpen) {
    heroCta = (
      <Button variant="primary" w="full" onClick={() => void onShare()}>
        <LuShare2 />
        Share task
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
          Send a quote
        </Button>
      </Link>
    )
  }

  return (
    <Box px={4} pt={3} pb={28}>
      <Stack gap={5} w="full">
        <Reveal speed="slow">
          <Stack gap={4} w="full">
            <StatusHeader />
            {heroCta}
          </Stack>
        </Reveal>

        <Tabs
          fitted
          sticky
          stickyTop={0}
          aria-label="Task sections"
          value={activeTab}
          onChange={onTabChange}
          tabs={[
            { key: TAB_INFO, label: 'Info' },
            { key: TAB_QUOTES, label: 'Quotes', badge: quoteCount },
          ]}
        >
          <Tabs.Panel value={TAB_INFO}>
            <Stack gap={5} w="full">
              <BookingSection order={order} />
              <TaskDetailsCard />
              <PhotosCard />
              <LocationCard />
              <TrustCard />
              <HelpActionsCard />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value={TAB_QUOTES}>
            <QuotesPanel />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Box>
  )
}

'use client'

import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { resolveStickySection } from '../../helpers/taskDetailSections'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import { useTaskDetailSectionContext } from '../../helpers/useTaskDetailSectionContext'
import bag from '../../i11n.json'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { Reveal } from './Reveal'
import { TaskPricingCard } from './openTask/TaskPricingCard'
import { TaskShareCard } from './openTask/TaskShareCard'

/**
 * Space so the last content line can scroll above the sticky card.
 * Sized for the tallest pin (visitor pricing + quote).
 */
export const TASK_DETAIL_CTA_CLEARANCE =
  'calc(16.5rem + env(safe-area-inset-bottom, 0px))' as const

function CompletionStickyCard() {
  const t = useI11n(bag)
  const { permissions, setActiveTab } = useTaskDetail()
  const isComplete = permissions.showCompleteWithCode
  const isConfirm = permissions.showCustomerCompletionCode

  if (!isComplete && !isConfirm) return null

  return (
    <Card layout="section" p={4}>
      <Box display="flex" flexDirection="column" gap={2}>
        <SafetyNotice variant={isComplete ? 'complete' : 'inline'} />
        <Button
          variant="primary"
          w="full"
          onClick={() => {
            setActiveTab(TASK_DETAIL_TAB.overview, {
              hash: isComplete ? 'worker-job-panel' : 'task-order',
              scrollId: isComplete ? 'worker-job-panel' : 'task-order',
            })
          }}
        >
          {isComplete ? t.cta.complete : t.cta.confirm}
        </Button>
      </Box>
    </Card>
  )
}

function stickyBody(id: ReturnType<typeof resolveStickySection>): ReactNode {
  switch (id) {
    case 'completion':
      return <CompletionStickyCard />
    case 'ownerContact':
      return <TaskOwnerCard sticky />
    case 'ownerShare':
      return <TaskShareCard />
    case 'pricingQuote':
      return <TaskPricingCard sticky />
    default:
      return null
  }
}

/**
 * Mobile-only bottom pin. Renders the single registry winner — never two
 * sticky bottoms, and never a competing desktop sticky system.
 */
export function TaskDetailCtaBar() {
  const t = useI11n(bag)
  const ctx = useTaskDetailSectionContext()
  const winner = resolveStickySection(ctx)
  const body = stickyBody(winner)
  if (!body) return null

  return (
    <Box
      display={{ base: 'block', lg: 'none' }}
      position="fixed"
      left={0}
      right={0}
      bottom={0}
      zIndex={25}
      pointerEvents="none"
      px={3}
      pt={2}
      pb="calc(10px + env(safe-area-inset-bottom, 0px))"
    >
      <Reveal>
        <Box pointerEvents="auto" aria-label={t.cta.barAria} as="section">
          {body}
        </Box>
      </Reveal>
    </Box>
  )
}

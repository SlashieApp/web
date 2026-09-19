'use client'

import { Box } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import {
  type TaskDetailSectionId,
  resolveTaskDetailStickySection,
} from '../../helpers/taskDetailSectionRegistry'
import { useTaskDetailSectionContext } from '../../helpers/useTaskDetailSectionContext'
import bag from '../../i11n.json'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { Reveal } from './Reveal'
import { TaskCompletionCard } from './openTask/TaskCompletionCard'
import { TaskPricingCard } from './openTask/TaskPricingCard'
import { TaskShareCard } from './openTask/TaskShareCard'

/**
 * Space so the last content line can scroll above the tallest sticky card
 * (pricing + quote). Smaller role cards leave extra room, which is fine.
 */
export const TASK_DETAIL_CTA_CLEARANCE =
  'calc(18rem + env(safe-area-inset-bottom, 0px))' as const

export const TASK_DETAIL_STICKY_CLEARANCE = TASK_DETAIL_CTA_CLEARANCE

function StickyCardBody({ id }: { id: TaskDetailSectionId }) {
  switch (id) {
    case 'pricingQuote':
      return <TaskPricingCard />
    case 'share':
      return <TaskShareCard />
    case 'owner':
      return <TaskOwnerCard roleActions />
    case 'completion':
      return <TaskCompletionCard />
    default:
      return null
  }
}

/**
 * Mobile-only role sticky. Desktop never mounts a competing pin (FE-154/161).
 * Winner comes from `resolveTaskDetailStickySection` — at most one card.
 */
export function TaskDetailStickyCard() {
  const t = useI11n(bag)
  const ctx = useTaskDetailSectionContext()
  const stickyId = resolveTaskDetailStickySection(ctx)

  if (!stickyId) return null

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
        <Box pointerEvents="auto" aria-label={t.cta.barAria} w="full">
          <StickyCardBody id={stickyId} />
        </Box>
      </Reveal>
    </Box>
  )
}

/** @deprecated Use {@link TaskDetailStickyCard}. Kept for existing imports. */
export const TaskDetailCtaBar = TaskDetailStickyCard

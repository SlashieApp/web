'use client'

import { Box, type SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useI11n } from '@/i18n/useI11n'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { useTaskDetailSectionLayout } from '../../helpers/useTaskDetailSectionLayout'
import bag from '../../i11n.json'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { Reveal } from './Reveal'
import { TaskConfirmStickyCard } from './openTask/TaskConfirmStickyCard'
import { TaskPricingCard } from './openTask/TaskPricingCard'
import { TaskShareCard } from './openTask/TaskShareCard'

/**
 * Space so the last content line can scroll above the role-pinned card.
 */
export const TASK_DETAIL_CTA_CLEARANCE =
  'calc(16rem + env(safe-area-inset-bottom, 0px))' as const

/**
 * Mobile bottom pin. Winner comes from the section registry so only one
 * overview card is sticky at a time.
 */
export function TaskDetailCtaBar() {
  const t = useI11n(bag)
  const { task, statusReady } = useTaskDetail()
  const { stickySectionId } = useTaskDetailSectionLayout()

  if (!statusReady || !task || !stickySectionId) return null

  let card: ReactNode = null
  switch (stickySectionId) {
    case 'pricing':
      card = <TaskPricingCard />
      break
    case 'share':
      card = <TaskShareCard />
      break
    case 'owner':
      card = <TaskOwnerCard includeActions />
      break
    case 'confirm':
      card = <TaskConfirmStickyCard />
      break
    default:
      card = null
  }

  if (!card) return null

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
        <Box
          pointerEvents="auto"
          css={stickyCardCss}
          aria-label={t.cta.barAria}
        >
          {card}
        </Box>
      </Reveal>
    </Box>
  )
}

const stickyCardCss = {
  '& > *': {
    boxShadow: 'var(--chakra-shadows-lg, 0 12px 32px rgba(11, 23, 20, 0.12))',
  },
} as SystemStyleObject

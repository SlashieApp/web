'use client'

import { Box, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuPencil } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, IconButton, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../helpers/getTaskDetailPrimaryCta'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import { useTaskDetailSections } from '../../helpers/useTaskDetailSections'
import bag from '../../i11n.json'
import { TaskOwnerCard } from '../overview/TaskOwnerCard'
import { TaskPricingCard } from '../overview/TaskPricingCard'
import { TaskShareCard } from '../overview/TaskShareCard'
import { TaskDetailPinCard } from '../ui/TaskDetailPinCard'

function TaskDetailCompletionBar() {
  const t = useI11n(bag)
  const { task, permissions, statusReady, setActiveTab } = useTaskDetail()

  if (!statusReady || !task) return null

  const kind = getTaskDetailPrimaryCta({
    permissions,
    quoteCount: task.quotes.length,
  })
  const showEdit = permissions.canEditTask
  if (kind !== 'confirm' && kind !== 'complete' && !showEdit) return null

  const editHref = `/tasks/${task.id}/edit`

  const action =
    kind === 'confirm' ? (
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          setActiveTab(TASK_DETAIL_TAB.overview, {
            hash: 'task-order',
            scrollId: 'task-order',
          })
        }}
      >
        {t.cta.confirm}
      </Button>
    ) : kind === 'complete' ? (
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          setActiveTab(TASK_DETAIL_TAB.overview, {
            hash: 'worker-job-panel',
            scrollId: 'worker-job-panel',
          })
        }}
      >
        {t.cta.complete}
      </Button>
    ) : null

  const title =
    kind === 'confirm'
      ? t.booking.customerTitle
      : kind === 'complete'
        ? t.booking.workerTitle
        : t.actions.editTask
  const subtitle =
    kind === 'confirm'
      ? t.booking.completionCode
      : kind === 'complete'
        ? t.verification.enterCodeCta
        : undefined

  return (
    <TaskDetailPinCard
      title={title}
      subtitle={subtitle}
      action={
        <HStack gap={1} align="center">
          {action}
          {showEdit ? (
            <IconButton
              asChild
              variant="ghost"
              size="sm"
              aria-label={t.cta.editAria}
            >
              <Link href={editHref} _hover={{ textDecoration: 'none' }}>
                <LuPencil />
              </Link>
            </IconButton>
          ) : null}
        </HStack>
      }
    />
  )
}

/**
 * Winning mobile pin card. Sticky chrome lives on TaskDetailTabLayout's
 * `mainCta` slot — this only picks which card to place there.
 */
export function TaskDetailMainCta() {
  const { pinnedId } = useTaskDetailSections()
  const { statusReady, task } = useTaskDetail()

  if (!statusReady || !task || !pinnedId) return null

  let pin: ReactNode = null
  switch (pinnedId) {
    case 'pricing':
      pin = <TaskPricingCard compact />
      break
    case 'share':
      pin = <TaskShareCard compact />
      break
    case 'owner':
      pin = <TaskOwnerCard compact />
      break
    case 'completion':
      pin = <TaskDetailCompletionBar />
      break
    default:
      pin = null
  }

  if (!pin) return null

  return <Box data-task-detail-pin={pinnedId}>{pin}</Box>
}

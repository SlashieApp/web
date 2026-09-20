'use client'

import { Box, HStack, type SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuPencil } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { WEB_MQ } from '@/theme/breakpoints'
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
import { Reveal } from './Reveal'

const PIN_FADE_HEIGHT =
  'calc(8.5rem + env(safe-area-inset-bottom, 0px))' as const

const surfaceVar = 'var(--chakra-colors-bg-surface, #FFFFFF)'

const reducedTransparencyQuery =
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)' as const

/** White wash that dissolves upward so scrolling cards fade under the pin. */
const pinFadeCss: SystemStyleObject = {
  background: `linear-gradient(to top, ${surfaceVar} 0%, color-mix(in srgb, ${surfaceVar} 88%, transparent) 38%, color-mix(in srgb, ${surfaceVar} 42%, transparent) 68%, transparent 100%)`,
  [reducedTransparencyQuery]: {
    background: `linear-gradient(to top, ${surfaceVar} 0%, color-mix(in srgb, ${surfaceVar} 92%, transparent) 55%, transparent 100%)`,
  },
}

function TaskDetailMainCtaFade() {
  return (
    <Box
      aria-hidden
      data-task-detail-main-cta-fade
      position="absolute"
      insetX={0}
      bottom={0}
      h={PIN_FADE_HEIGHT}
      pointerEvents="none"
      css={pinFadeCss}
    />
  )
}

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
 * Compact mobile/tablet pin at the bottom of the page — outside the tabs
 * so it stays put when the active tab changes.
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

  return (
    <Box
      data-task-detail-main-cta
      data-task-detail-pin={pinnedId}
      css={{
        display: 'block',
        [`@media screen and ${WEB_MQ}`]: { display: 'none' },
      }}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex={25}
      pointerEvents="none"
    >
      <TaskDetailMainCtaFade />
      <Box
        position="relative"
        px={3}
        pt={2}
        pb="calc(10px + env(safe-area-inset-bottom, 0px))"
      >
        <Reveal>
          <Box pointerEvents="auto">{pin}</Box>
        </Reveal>
      </Box>
    </Box>
  )
}

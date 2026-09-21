'use client'

import { Box, HStack, type SystemStyleObject } from '@chakra-ui/react'
import { createPortal } from 'react-dom'
import { LuPencil } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { WEB_MQ } from '@/theme/breakpoints'
import { useIsBrowser } from '@/utils/useIsBrowser'
import { Button, Card, IconButton, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../helpers/getTaskDetailPrimaryCta'
import { TASK_DETAIL_RAIL_CARD } from '../../helpers/taskDetailLayout'
import type { TaskDetailSectionId } from '../../helpers/taskDetailStickySections'
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

function TaskDetailCompletionBar({ web = false }: { web?: boolean }) {
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

  const actions = (
    <HStack gap={web ? 2 : 1} align="center">
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
  )

  if (web) {
    return (
      <Card {...TASK_DETAIL_RAIL_CARD} eyebrow={title} description={subtitle}>
        {actions}
      </Card>
    )
  }

  return (
    <TaskDetailPinCard title={title} subtitle={subtitle} action={actions} />
  )
}

function MainCtaCard({
  pinnedId,
  surface,
}: {
  pinnedId: TaskDetailSectionId
  surface: 'pin' | 'web'
}) {
  const compact = surface === 'pin'
  const web = surface === 'web'
  switch (pinnedId) {
    case 'pricing':
      return <TaskPricingCard compact={compact} rail={web} />
    case 'share':
      return <TaskShareCard compact={compact} rail={web} />
    case 'owner':
      return <TaskOwnerCard compact={compact} rail={web} />
    case 'completion':
      return <TaskDetailCompletionBar web={web} />
    default:
      return null
  }
}

/**
 * Role-aware primary CTA. Compact (phone + tablet): fixed to the viewport
 * bottom (portaled so Reveal's transform does not contain it). Web: compact
 * card absolutely aligned to the end (bottom-right) of TabIntro, outside
 * the cards|rail grid.
 */
export function TaskDetailMainCta() {
  const { pinnedId } = useTaskDetailSections()
  const { statusReady, task } = useTaskDetail()
  const isBrowser = useIsBrowser()

  if (!statusReady || !task || !pinnedId) return null
  if (
    pinnedId !== 'pricing' &&
    pinnedId !== 'share' &&
    pinnedId !== 'owner' &&
    pinnedId !== 'completion'
  ) {
    return null
  }

  const webCard = <MainCtaCard pinnedId={pinnedId} surface="web" />
  const pinCard = <MainCtaCard pinnedId={pinnedId} surface="pin" />

  const compactPin = (
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
          <Box pointerEvents="auto">{pinCard}</Box>
        </Reveal>
      </Box>
    </Box>
  )

  return (
    <>
      <Box
        data-task-detail-main-cta
        data-task-detail-pin={pinnedId}
        display={{ base: 'none', lg: 'block' }}
        w="full"
        minW={0}
      >
        {webCard}
      </Box>
      {isBrowser ? createPortal(compactPin, document.body) : compactPin}
    </>
  )
}

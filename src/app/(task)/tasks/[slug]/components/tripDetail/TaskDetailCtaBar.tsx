'use client'

import { Box, HStack, Stack, type SystemStyleObject } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuPencil } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, IconButton, Link, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../helpers/getTaskDetailPrimaryCta'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import { useTaskDetailSections } from '../../helpers/useTaskDetailSections'
import bag from '../../i11n.json'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { Reveal } from './Reveal'
import { TaskPricingCard } from './openTask/TaskPricingCard'
import { TaskShareCard } from './openTask/TaskShareCard'

const surfaceVar = 'var(--chakra-colors-bg-surface, #FFFFFF)'
const reducedTransparencyQuery =
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)' as const

const glassBarCss = {
  background: `color-mix(in srgb, ${surfaceVar} 78%, transparent)`,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  [reducedTransparencyQuery]: {
    background: `color-mix(in srgb, ${surfaceVar} 96%, transparent)`,
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  },
} as SystemStyleObject

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
        w="full"
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
        w="full"
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

  return (
    <Stack
      as="section"
      gap={1.5}
      pointerEvents="auto"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      px={3}
      py={2.5}
      css={glassBarCss}
      aria-label={t.cta.barAria}
    >
      <SafetyNotice variant={kind === 'complete' ? 'complete' : 'inline'} />
      <HStack gap={2} align="center">
        {action ? <Box flex="1">{action}</Box> : <Box flex="1" />}
        {showEdit ? (
          <IconButton asChild variant="ghost" aria-label={t.cta.editAria}>
            <Link href={editHref} _hover={{ textDecoration: 'none' }}>
              <LuPencil />
            </Link>
          </IconButton>
        ) : null}
      </HStack>
    </Stack>
  )
}

/**
 * Mobile bottom pin. Exactly one card wins via `resolveTaskDetailSections`
 * (`mobile-bottom` conflict group). Desktop keeps the column layout — this
 * host is hidden at `lg`.
 */
export function TaskDetailCtaBar() {
  const { pinnedId } = useTaskDetailSections()
  const { statusReady, task } = useTaskDetail()

  if (!statusReady || !task || !pinnedId) return null

  let pin: ReactNode = null
  switch (pinnedId) {
    case 'pricing':
      pin = <TaskPricingCard sharePriceTransition={false} />
      break
    case 'share':
      pin = <TaskShareCard />
      break
    case 'owner':
      pin = <TaskOwnerCard variant="stickyBar" />
      break
    case 'completion':
      pin = <TaskDetailCompletionBar />
      break
    default:
      pin = null
  }

  if (!pin) return null

  const flushContactBar = pinnedId === 'owner'

  return (
    <Box
      data-task-detail-pin={pinnedId}
      css={{
        display: 'block',
        '@media screen and (min-width: 62em)': { display: 'none' },
      }}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex={25}
      pointerEvents="none"
      px={flushContactBar ? 0 : 3}
      pt={flushContactBar ? 0 : 2}
      pb={flushContactBar ? 0 : 'calc(10px + env(safe-area-inset-bottom, 0px))'}
    >
      <Reveal>
        {flushContactBar ? (
          <Box
            pointerEvents="auto"
            bg="bg.surface"
            borderTopWidth="1px"
            borderColor="border.default"
            px={4}
            pt={3}
            pb="calc(0.75rem + env(safe-area-inset-bottom))"
            boxShadow="e3"
          >
            {pin}
          </Box>
        ) : (
          <Box pointerEvents="auto">{pin}</Box>
        )}
      </Reveal>
    </Box>
  )
}

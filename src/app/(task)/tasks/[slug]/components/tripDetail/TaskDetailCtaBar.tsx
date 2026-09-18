'use client'

import { Box, HStack, Stack, type SystemStyleObject } from '@chakra-ui/react'
import { LuPencil, LuShare2 } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, IconButton, Link, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../helpers/getTaskDetailPrimaryCta'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import bag from '../../i11n.json'
import { Reveal } from './Reveal'
import { useShareTask } from './openTask/shareTask'

const surfaceVar = 'var(--chakra-colors-bg-surface, #FFFFFF)'
const reducedTransparencyQuery =
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)' as const

function QuoteCta({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="primary" w="full">
      <Link href={href} _hover={{ textDecoration: 'none' }}>
        {label}
      </Link>
    </Button>
  )
}

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

/**
 * Space so the last content line can scroll above the floating CTA.
 */
export const TASK_DETAIL_CTA_CLEARANCE =
  'calc(7.5rem + env(safe-area-inset-bottom, 0px))' as const

/**
 * Floating glass primary CTA. Role-mapped via `getTaskDetailPrimaryCta`.
 * Fixed to the viewport bottom on mobile (no dock on task detail).
 */
export function TaskDetailCtaBar() {
  const t = useI11n(bag)
  const { task, permissions, statusReady, setActiveTab } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!statusReady || !task) return null

  const kind = getTaskDetailPrimaryCta({
    permissions,
    quoteCount: task.quotes.length,
  })
  const showEdit = permissions.canEditTask
  if (kind === 'none' && !showEdit) return null

  const quoteHref = `/tasks/${task.id}/quote`
  const editHref = `/tasks/${task.id}/edit`

  let action: React.ReactNode = null
  switch (kind) {
    case 'sendQuote':
      action = <QuoteCta href={quoteHref} label={t.cta.sendQuote} />
      break
    case 'signInToQuote':
      action = <QuoteCta href={quoteHref} label={t.cta.signInToQuote} />
      break
    case 'viewQuotes':
      action = (
        <Button
          variant="primary"
          w="full"
          onClick={() => setActiveTab(TASK_DETAIL_TAB.quotes)}
        >
          {t.cta.viewQuotes}
        </Button>
      )
      break
    case 'share':
      action = (
        <Button variant="primary" w="full" onClick={() => void onShare()}>
          <LuShare2 />
          {t.cta.shareTask}
        </Button>
      )
      break
    case 'complete':
      action = (
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
      )
      break
    case 'confirm':
      action = (
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
      )
      break
    default:
      action = null
  }

  const safetyVariant = kind === 'complete' ? 'complete' : 'inline'

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
          <SafetyNotice variant={safetyVariant} />
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
      </Reveal>
    </Box>
  )
}

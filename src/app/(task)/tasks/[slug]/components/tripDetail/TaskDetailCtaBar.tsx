'use client'

import { Box, HStack, Stack, type SystemStyleObject } from '@chakra-ui/react'
import { LuPencil, LuShare2 } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { MOBILE_BOTTOM_NAV_CLEARANCE } from '@/ui/MobileBottomNav'
import { Button, IconButton, Link, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../helpers/getTaskDetailPrimaryCta'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import bag from '../../i11n.json'
import { useShareTask } from './openTask/shareTask'

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

/**
 * Space so the last content line clears this bar. Dock clearance lives on the
 * (task) layout `main`; this is only the CTA stack itself.
 */
export const TASK_DETAIL_CTA_CLEARANCE = '112px' as const

/**
 * Floating glass primary CTA. Role-mapped via `getTaskDetailPrimaryCta`.
 * Sits above the mobile dock (safe-area + nav clearance) and does not cover
 * tab content thanks to matching page padding.
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
      action = (
        <Button asChild variant="primary" w="full">
          <Link href={quoteHref} _hover={{ textDecoration: 'none' }}>
            {t.cta.sendQuote}
          </Link>
        </Button>
      )
      break
    case 'signInToQuote':
      action = (
        <Button asChild variant="primary" w="full">
          <Link href={quoteHref} _hover={{ textDecoration: 'none' }}>
            {t.cta.signInToQuote}
          </Link>
        </Button>
      )
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
            setActiveTab(TASK_DETAIL_TAB.activity, {
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
            setActiveTab(TASK_DETAIL_TAB.activity, {
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
      position="sticky"
      bottom={{ base: MOBILE_BOTTOM_NAV_CLEARANCE, md: 0 }}
      zIndex={25}
      pointerEvents="none"
      px={{ base: 3, md: 0 }}
      pt={2}
      pb={{ base: 2, md: 3 }}
    >
      <Stack
        as="section"
        gap={2}
        pointerEvents="auto"
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="xl"
        px={3}
        py={3}
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
    </Box>
  )
}

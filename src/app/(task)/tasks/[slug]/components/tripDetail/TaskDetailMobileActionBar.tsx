'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Skeleton } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuMessageCircle, LuShare2 } from 'react-icons/lu'
import bag from '../../i11n.json'

import { Button, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { resolveTaskDetailMobilePrimary } from '../../helpers/taskDetailMobilePrimary'
import type { TaskDetailTab } from '../../helpers/taskDetailTabs'
import { useShareTask } from './openTask/shareTask'

const ACTION_BAR_SAFE_PB = 'calc(10px + env(safe-area-inset-bottom, 0px))'

type TaskDetailMobileActionBarProps = {
  onSelectTab: (tab: TaskDetailTab) => void
}

/**
 * Fixed mobile action bar: Share · role-aware primary · Messages void.
 * Edit / cancel stay in the overflow menu, not here.
 */
export function TaskDetailMobileActionBar({
  onSelectTab,
}: TaskDetailMobileActionBarProps) {
  const { task, permissions, statusReady, isAuthenticated } = useTaskDetail()
  const t = useI11n(bag)
  const title = task?.title?.trim() || t.fallbackTask
  const onShare = useShareTask(title)

  if (!task) return null

  const primary = resolveTaskDetailMobilePrimary({
    permissions,
    isAuthenticated,
    quoteCount: task.quotes.length,
    taskId: task.id,
  })

  const primaryLabel =
    primary.kind === 'sendQuote'
      ? t.mobile.sendQuote
      : primary.kind === 'viewQuotes'
        ? t.mobile.viewQuotes
        : primary.kind === 'completeJob'
          ? t.mobile.completeJob
          : primary.kind === 'signIn'
            ? t.mobile.signIn
            : t.mobile.share

  let primaryControl: ReactNode
  if (!statusReady) {
    primaryControl = <Skeleton h="44px" flex="1" borderRadius="md" />
  } else if (primary.href) {
    primaryControl = (
      <Button asChild variant="primary" flex="1" minH="44px">
        <Link href={primary.href} _hover={{ textDecoration: 'none' }}>
          {primaryLabel}
        </Link>
      </Button>
    )
  } else if (primary.tab) {
    primaryControl = (
      <Button
        type="button"
        variant="primary"
        flex="1"
        minH="44px"
        onClick={() => onSelectTab(primary.tab as TaskDetailTab)}
      >
        {primaryLabel}
      </Button>
    )
  } else {
    primaryControl = (
      <Button
        type="button"
        variant="primary"
        flex="1"
        minH="44px"
        onClick={() => void onShare()}
      >
        {primaryLabel}
      </Button>
    )
  }

  return (
    <Box
      flexShrink={0}
      bg="bg.canvas"
      borderTopWidth="1px"
      borderColor="border.default"
      px={3}
      pt={2}
      pb={ACTION_BAR_SAFE_PB}
    >
      <HStack gap={2} align="center" minH="44px">
        <Button
          type="button"
          variant="ghost"
          minH="44px"
          px={3}
          onClick={() => void onShare()}
        >
          <LuShare2 />
          {t.mobile.share}
        </Button>

        {primaryControl}

        <Button
          type="button"
          variant="ghost"
          minH="44px"
          px={3}
          disabled
          opacity={0.45}
          aria-label={t.mobile.messagesUnavailable}
        >
          <LuMessageCircle />
          {t.mobile.messages}
        </Button>
      </HStack>
    </Box>
  )
}

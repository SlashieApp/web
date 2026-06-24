'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import {
  LuArrowLeft,
  LuEllipsisVertical,
  LuFlag,
  LuShare2,
} from 'react-icons/lu'

import { showAppToast } from '@/utils/appToast'
import { Button, Dropdown, IconButton, useDropdownClose } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskCategoryLabel } from '../../helpers/taskDetailUtils'

function OverflowMenu({ title }: { title: string }) {
  const close = useDropdownClose()

  const onShare = useCallback(async () => {
    close()
    const url = typeof window !== 'undefined' ? window.location.href : ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      showAppToast({ title: 'Link copied', type: 'success' })
    } catch {
      // user dismissed the share sheet - no-op
    }
  }, [close, title])

  const onReport = useCallback(() => {
    close()
    showAppToast({
      title: 'Report received',
      description: 'Thanks - our safety team will review this task.',
      type: 'info',
    })
  }, [close])

  return (
    <Stack gap={1} p={1} minW="200px">
      <Button
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        onClick={() => void onShare()}
      >
        <LuShare2 />
        Share task
      </Button>
      <Button
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        onClick={onReport}
      >
        <LuFlag />
        Report task
      </Button>
    </Stack>
  )
}

/** Trip-detail app bar: back · title · overflow (Share, Report). */
export function TaskDetailAppBar() {
  const router = useRouter()
  const { task } = useTaskDetail()

  const title =
    task?.title?.trim() || (task && taskCategoryLabel(task)) || 'Task'

  return (
    <HStack gap={2} w="full" align="center" minH="44px">
      <IconButton
        type="button"
        variant="ghost"
        aria-label="Go back"
        onClick={() => router.back()}
      >
        <LuArrowLeft />
      </IconButton>
      <Text
        flex="1"
        minW={0}
        fontWeight={600}
        fontSize="md"
        color="text.default"
        truncate
      >
        {title}
      </Text>
      <Dropdown
        contentLabel="Task options"
        align="end"
        trigger={
          <IconButton type="button" variant="ghost" aria-label="Task options">
            <LuEllipsisVertical />
          </IconButton>
        }
      >
        <OverflowMenu title={title} />
      </Dropdown>
    </HStack>
  )
}

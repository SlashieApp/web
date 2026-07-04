'use client'

import { HStack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { LuArrowLeft, LuEllipsisVertical } from 'react-icons/lu'

import { Dropdown, IconButton } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskCategoryLabel } from '../../helpers/taskDetailUtils'
import { TaskOverflowMenu } from './TaskOverflowMenu'

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
        <TaskOverflowMenu />
      </Dropdown>
    </HStack>
  )
}

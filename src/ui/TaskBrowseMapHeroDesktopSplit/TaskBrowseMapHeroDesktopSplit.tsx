'use client'

import { HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { TaskFilter } from '../TaskFilter/TaskFilter'
import { TaskListPanel } from '../TaskListPanel/TaskListPanel'

export type TaskBrowseMapHeroDesktopSplitProps = {
  filters: ReactNode
  taskList: ReactNode
}

export function TaskBrowseMapHeroDesktopSplit({
  filters,
  taskList,
}: TaskBrowseMapHeroDesktopSplitProps) {
  return (
    <HStack
      align="stretch"
      gap={4}
      flex={1}
      minH={0}
      minW={0}
      w="full"
      display={{ base: 'none', md: 'flex' }}
    >
      <TaskFilter>{filters}</TaskFilter>
      <TaskListPanel>{taskList}</TaskListPanel>
    </HStack>
  )
}

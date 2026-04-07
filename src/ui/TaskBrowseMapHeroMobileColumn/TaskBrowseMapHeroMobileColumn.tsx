'use client'

import { Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { TaskBrowseFloatingPanel } from '../TaskBrowseFloatingPanel/TaskBrowseFloatingPanel'
import { TaskBrowseMobileFiltersBar } from '../TaskBrowseMobileFiltersBar/TaskBrowseMobileFiltersBar'

export type TaskBrowseMapHeroMobileColumnProps = {
  onOpenFilters: () => void
  taskList: ReactNode
}

export function TaskBrowseMapHeroMobileColumn({
  onOpenFilters,
  taskList,
}: TaskBrowseMapHeroMobileColumnProps) {
  return (
    <Stack
      gap={0}
      flex={1}
      minH={0}
      display={{ base: 'flex', md: 'none' }}
      flexDirection="column"
    >
      <TaskBrowseMobileFiltersBar onOpenFilters={onOpenFilters} />
      <TaskBrowseFloatingPanel flex={1} minH={0}>
        {taskList}
      </TaskBrowseFloatingPanel>
    </Stack>
  )
}

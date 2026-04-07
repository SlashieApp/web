'use client'

import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { TaskBrowseFloatingPanel } from '../TaskBrowseFloatingPanel/TaskBrowseFloatingPanel'
import { Text } from '../Typography'

export type TaskFilterProps = {
  children: ReactNode
  title?: string
}

export function TaskFilter({ children, title = 'Filters' }: TaskFilterProps) {
  return (
    <TaskBrowseFloatingPanel
      flex="0 1 auto"
      w="min(300px, 26vw)"
      maxW="320px"
      minW={0}
      minH={0}
    >
      <Box
        px={4}
        py={3}
        flexShrink={0}
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Text fontWeight={700} fontSize="sm" color="fg">
          {title}
        </Text>
      </Box>
      <Box flex={1} minH={0} overflowY="auto" px={2} py={3}>
        {children}
      </Box>
    </TaskBrowseFloatingPanel>
  )
}

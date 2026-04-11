'use client'

import { Box } from '@chakra-ui/react'

import {
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { TaskBrowseFilters } from './TaskBrowseFilters'
import { TaskList } from './TaskList'

/**
 * Web task browse: when filters are open, this panel occupies the same flex
 * region as {@link TaskList}; otherwise the list is shown.
 */
export function WebTaskBrowseFiltersBlock() {
  const { isFilterOpen } = useTaskBrowseLayout()
  const filterProps = useTaskBrowseFiltersProps('compact')

  return (
    <Box flex={1} minH={0} mb={6}>
      {isFilterOpen ? (
        <Box h="full" overflowY="auto" pr={{ base: 1, md: 0 }}>
          <TaskBrowseFilters {...filterProps} />
        </Box>
      ) : (
        <TaskList />
      )}
    </Box>
  )
}

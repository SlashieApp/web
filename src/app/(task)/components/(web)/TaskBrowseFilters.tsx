'use client'

import { Box } from '@chakra-ui/react'

import type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../taskBrowseFilters.types'
import {
  TaskBrowseFiltersCompactPanel,
  TaskBrowseFiltersDefaultPanel,
} from '../taskBrowseFiltersShared'

export type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../taskBrowseFilters.types'

export function TaskBrowseFilters({
  variant = 'default',
  ...props
}: TaskBrowseFiltersProps) {
  if (variant === 'compact') {
    return (
      <Box
        borderRadius="xl"
        bg="surfaceContainerLow"
        p={{ base: 3, md: 4 }}
        boxShadow="ghostBorder"
      >
        <TaskBrowseFiltersCompactPanel {...props} />
      </Box>
    )
  }

  return (
    <Box
      borderRadius="xl"
      bg="surfaceContainerLow"
      p={{ base: 5, md: 6 }}
      boxShadow="ghostBorder"
    >
      <TaskBrowseFiltersDefaultPanel {...props} />
    </Box>
  )
}

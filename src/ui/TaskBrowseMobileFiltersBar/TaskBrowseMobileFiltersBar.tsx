'use client'

import { Box, HStack } from '@chakra-ui/react'

import { Button } from '../Button'

export type TaskBrowseMobileFiltersBarProps = {
  onOpenFilters: () => void
}

export function TaskBrowseMobileFiltersBar({
  onOpenFilters,
}: TaskBrowseMobileFiltersBarProps) {
  return (
    <Box px={{ base: 3, md: 4 }} pt={{ base: 3, md: 4 }} pb={2} flexShrink={0}>
      <HStack gap={2} flexWrap="wrap" align="center">
        <Button
          type="button"
          variant="subtle"
          bg="surfaceContainerHigh"
          size="sm"
          onClick={onOpenFilters}
        >
          Filters
        </Button>
      </HStack>
    </Box>
  )
}

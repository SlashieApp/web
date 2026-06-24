'use client'

import { Box, Spinner, Text } from '@chakra-ui/react'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'

/** Compact loader centered over the browse map during the first tasks fetch. */
export function TaskBrowseMapLoader() {
  const { isInitialTasksLoad } = useTaskBrowseData()

  if (!isInitialTasksLoad) return null

  return (
    <Box
      position="absolute"
      inset={0}
      zIndex={2}
      display="flex"
      alignItems="center"
      justifyContent="center"
      pointerEvents="none"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        px={4}
        py={3}
        borderRadius="xl"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        boxShadow="e3"
      >
        <Spinner size="sm" color="status.success.fg" />
        <Text fontSize="xs" color="text.muted">
          Finding tasks…
        </Text>
      </Box>
    </Box>
  )
}

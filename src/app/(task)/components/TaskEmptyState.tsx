'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'

type EmptyMode = 'noNearby' | 'filtered'

/**
 * Empty-state card for the task browse experience. Reads browse state directly
 * and renders copy for "no nearby tasks" vs "filters exclude everything".
 * Initial load spinner lives on the map ({@link TaskBrowseMapLoader}).
 */
export function TaskEmptyState() {
  const { browseSourceTaskCount } = useTaskBrowseData()

  const mode: EmptyMode = browseSourceTaskCount > 0 ? 'filtered' : 'noNearby'

  return (
    <Box
      bg="bg.surface"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border.default"
      boxShadow="e4"
      w="full"
      mx="auto"
      maxW="full"
      px={{ base: 5, md: 6 }}
      py={{ base: 6, md: 7 }}
      pointerEvents="auto"
    >
      <Stack gap={4} align="center" textAlign="center">
        {mode === 'filtered' ? (
          <Stack gap={1}>
            <Heading size="md" color="text.default">
              No tasks match your filters
            </Heading>
            <Text fontSize="sm" color="text.muted">
              Try clearing your filters or widening your search area.
            </Text>
          </Stack>
        ) : (
          <Stack gap={1}>
            <Heading size="md" color="text.default">
              No nearby tasks right now
            </Heading>
            <Text fontSize="sm" color="text.muted">
              Try expanding your search area or browse tasks in nearby towns.
            </Text>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

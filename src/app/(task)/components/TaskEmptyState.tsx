'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'
import { hasClearableBrowseFilterTags } from '../helpers/taskBrowseHelpers'
import bag from './i11n.json'

/**
 * Empty-state card for the task browse experience.
 * Initial load spinner lives on the map ({@link TaskBrowseMapLoader}).
 */
export function TaskEmptyState() {
  const t = useI11n(bag)
  const { activeFilterTags, clearAllBrowseFilters } = useTaskBrowseData()
  const canClear = hasClearableBrowseFilterTags(activeFilterTags)

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
        <Stack gap={1}>
          <Heading size="md" color="text.default">
            {t.emptyTitle}
          </Heading>
          <Text fontSize="sm" color="text.muted">
            {t.emptyDescription}
          </Text>
        </Stack>
        {canClear ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={clearAllBrowseFilters}
          >
            {t.clearFilters}
          </Button>
        ) : null}
      </Stack>
    </Box>
  )
}

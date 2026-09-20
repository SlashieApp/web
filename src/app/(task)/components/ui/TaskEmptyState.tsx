'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Button, Card } from '@ui'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { hasClearableBrowseFilterTags } from '../../helpers/taskBrowseHelpers'
import bag from '../i11n.json'

/**
 * Empty-state card for the task browse experience.
 * Initial load uses {@link TaskCard} with `loading` in the list and carousel.
 */
export function TaskEmptyState() {
  const t = useI11n(bag)
  const { activeFilterTags, clearAllBrowseFilters } = useTaskBrowseData()
  const canClear = hasClearableBrowseFilterTags(activeFilterTags)

  return (
    <Card
      w="full"
      mx="auto"
      maxW="full"
      p={{ base: 6, md: 7 }}
      boxShadow="e3"
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
    </Card>
  )
}

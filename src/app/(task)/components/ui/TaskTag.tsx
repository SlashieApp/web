'use client'

import { HStack } from '@chakra-ui/react'
import { LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'
import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import bag from '../i11n.json'

/**
 * Applied search / date / budget filters as removable chips, plus Clear all.
 * Shown under the collapsed mobile search bar so the filter is visible while
 * the sheet is closed.
 */
export function TaskTag() {
  const t = useI11n(bag)
  const { activeFilterTags, clearAllBrowseFilters, removeBrowseFilterTag } =
    useTaskBrowseData()

  if (activeFilterTags.length === 0) return null

  return (
    <HStack gap={2} flexWrap="wrap">
      {activeFilterTags.map((tag) => (
        <Button
          key={tag.kind}
          type="button"
          size="xs"
          variant="ghost"
          pointerEvents="auto"
          px={2.5}
          py={1}
          h="auto"
          minH={0}
          borderRadius="full"
          bg="action.primary"
          color="text.onGreen"
          fontSize="xs"
          fontWeight={500}
          boxShadow="none"
          _hover={{ bg: 'action.primaryHover', color: 'text.onGreen' }}
          aria-label={formatMessage(t.removeFilter, { label: tag.label })}
          onClick={() => removeBrowseFilterTag(tag)}
        >
          {tag.label}
          <LuX size={12} strokeWidth={2.5} aria-hidden />
        </Button>
      ))}
      <Button
        type="button"
        size="xs"
        variant="ghost"
        pointerEvents="auto"
        px={2}
        py={1}
        h="auto"
        minH={0}
        borderRadius="full"
        fontSize="xs"
        fontWeight={500}
        color="text.muted"
        onClick={clearAllBrowseFilters}
      >
        {t.clearAll}
      </Button>
    </HStack>
  )
}

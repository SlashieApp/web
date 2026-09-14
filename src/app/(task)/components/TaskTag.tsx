'use client'

import { HStack } from '@chakra-ui/react'
import { LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button } from '@ui'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'
import {
  type BrowseFilterTag,
  hasClearableBrowseFilterTags,
  isClearableBrowseFilterTag,
} from '../helpers/taskBrowseHelpers'
import bag from './i11n.json'

/** Tags from last submitted browse filters (see {@link useTaskBrowseData}). */
export function useActiveFilterTags(): readonly BrowseFilterTag[] {
  return useTaskBrowseData().activeFilterTags
}

function tagKey(tag: BrowseFilterTag, index: number): string {
  return `${tag.kind}-${index}-${tag.label}`
}

/** Compact chips for applied browse filters (filter open/close lives on {@link TaskSearch}). */
export function TaskTag() {
  const t = useI11n(bag)
  const {
    activeFilterTags,
    syncDraftFiltersFromSubmitted,
    clearAllBrowseFilters,
    removeBrowseFilterTag,
  } = useTaskBrowseData()
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()

  const openFilters = () => {
    if (!isFilterOpen) syncDraftFiltersFromSubmitted()
    setIsFilterOpen(true)
  }

  const showClearAll = hasClearableBrowseFilterTags(activeFilterTags)

  return (
    <HStack gap={2} flexWrap="wrap">
      {activeFilterTags.map((tag, index) => {
        const clearable = isClearableBrowseFilterTag(tag)
        if (clearable) {
          return (
            <Button
              key={tagKey(tag, index)}
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
              fontWeight={700}
              boxShadow="none"
              _hover={{ bg: 'action.primaryHover', color: 'text.onGreen' }}
              aria-label={formatMessage(t.removeFilter, { label: tag.label })}
              onClick={() => removeBrowseFilterTag(tag)}
            >
              {tag.label}
              <LuX size={12} strokeWidth={2.5} aria-hidden />
            </Button>
          )
        }
        return (
          <Button
            key={tagKey(tag, index)}
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
            fontWeight={700}
            boxShadow="none"
            _hover={{ bg: 'action.primaryHover', color: 'text.onGreen' }}
            onClick={openFilters}
          >
            {tag.label}
          </Button>
        )
      })}
      {showClearAll ? (
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
          fontWeight={700}
          color="text.muted"
          onClick={clearAllBrowseFilters}
        >
          {t.clearAll}
        </Button>
      ) : null}
    </HStack>
  )
}

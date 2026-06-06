'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuSearch } from 'react-icons/lu'

import { Button, Input, Select } from '@ui'

import { TASK_CREATE_CATEGORY_OPTIONS } from '@/app/(task)/helpers/taskCategories'

import {
  INBOX_SORT_OPTIONS,
  type InboxSortChoice,
  type TaskInboxFiltersState,
} from '../helpers/useTaskInboxFilters'

type TaskInboxFiltersProps = {
  filters: TaskInboxFiltersState
  /** Placeholder for the search field, e.g. "Search your requests". */
  searchPlaceholder?: string
}

const FIELD_LABEL = {
  fontSize: 'xs',
  fontWeight: 700,
  letterSpacing: '0.04em',
  color: 'formLabelMuted',
  textTransform: 'uppercase' as const,
}

/**
 * Shared server-side filter bar for the worker/customer inbox lists
 * (`/requests`, `/quotes`). Wires search, category, sort, and a created-date
 * range into the {@link TaskInboxFiltersState} hook.
 */
export function TaskInboxFilters({
  filters,
  searchPlaceholder = 'Search tasks',
}: TaskInboxFiltersProps) {
  const {
    searchDraft,
    setSearchDraft,
    commitSearch,
    category,
    setCategory,
    sort,
    setSort,
    createdAfter,
    setCreatedAfter,
    createdBefore,
    setCreatedBefore,
    reset,
    isActive,
  } = filters

  return (
    <Stack
      gap={3}
      p={4}
      borderRadius="xl"
      bg="cardBg"
      borderWidth="1px"
      borderColor="cardBorder"
    >
      <HStack gap={3} align="flex-end" flexWrap="wrap">
        <Stack gap={1} flex="1 1 240px" minW="200px">
          <Text {...FIELD_LABEL}>Search</Text>
          <Input
            startElement={
              <Box as="span" aria-hidden display="inline-flex">
                <LuSearch size={18} strokeWidth={2} />
              </Box>
            }
            value={searchDraft}
            placeholder={searchPlaceholder}
            type="search"
            inputMode="search"
            autoComplete="off"
            aria-label="Search tasks"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchDraft(e.target.value)
            }
            onBlur={commitSearch}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              commitSearch()
            }}
          />
        </Stack>

        <Stack gap={1} flex="0 1 180px" minW="150px">
          <Text {...FIELD_LABEL}>Category</Text>
          <Select
            value={category}
            aria-label="Filter by category"
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
            }
          >
            <option value="">All categories</option>
            {TASK_CREATE_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Stack>

        <Stack gap={1} flex="0 1 180px" minW="150px">
          <Text {...FIELD_LABEL}>Sort</Text>
          <Select
            value={sort}
            aria-label="Sort tasks"
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSort(e.target.value as InboxSortChoice)
            }
          >
            {INBOX_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Stack>
      </HStack>

      <HStack gap={3} align="flex-end" flexWrap="wrap">
        <Stack gap={1} flex="0 1 180px" minW="150px">
          <Text {...FIELD_LABEL}>Posted from</Text>
          <Input
            type="date"
            value={createdAfter}
            aria-label="Posted on or after"
            max={createdBefore || undefined}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCreatedAfter(e.target.value)
            }
          />
        </Stack>

        <Stack gap={1} flex="0 1 180px" minW="150px">
          <Text {...FIELD_LABEL}>Posted to</Text>
          <Input
            type="date"
            value={createdBefore}
            aria-label="Posted on or before"
            min={createdAfter || undefined}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCreatedBefore(e.target.value)
            }
          />
        </Stack>

        {isActive ? (
          <Button
            size="sm"
            variant="ghost"
            alignSelf="flex-end"
            onClick={reset}
          >
            Clear filters
          </Button>
        ) : null}
      </HStack>
    </Stack>
  )
}

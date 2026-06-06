'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { TASK_CREATE_CATEGORY_OPTIONS } from '@/app/(task)/helpers/taskCategories'

import { Button, Input, Select } from '@ui'

import {
  type PostedTaskListFilter,
  postedTaskFilterLabel,
  postedTaskStage,
} from '../../helpers/postedTaskCustomer'
import {
  INBOX_SORT_OPTIONS,
  type InboxSortChoice,
} from '../../helpers/useTaskInboxFilters'
import { useMyRequestsPage } from '../context/MyRequestsProvider'

const STAGE_FILTERS: PostedTaskListFilter[] = ['all', 'quoting', 'booked']

const PRICE_TYPE_OPTIONS = [
  { value: '', label: 'Any price type' },
  { value: 'ONE_OFF', label: 'Fixed price' },
  { value: 'PER_HOUR', label: 'Per hour' },
  { value: 'PER_DAY', label: 'Per day' },
]

const SECTION_LABEL = {
  fontSize: 'xs',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: 'formLabelMuted',
  textTransform: 'uppercase' as const,
}

function FilterAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Stack gap={0} borderTopWidth="1px" borderColor="cardBorder">
      <Button
        type="button"
        variant="ghost"
        w="full"
        justifyContent="space-between"
        px={0}
        py={3}
        h="auto"
        minH={0}
        fontWeight={600}
        fontSize="sm"
        color="cardFg"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {title}
        <Box
          as="span"
          display="inline-flex"
          color="formLabelMuted"
          transform={open ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.15s ease"
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <title>Expand</title>
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      </Button>
      {open ? <Box pb={3}>{children}</Box> : null}
    </Stack>
  )
}

export function MyRequestsFilterColumn() {
  const {
    activeRows,
    completedRows,
    tab,
    setTab,
    stageFilter,
    setStageFilter,
    inboxFilters,
    locationFilter,
    setLocationFilter,
    priceTypeFilter,
    setPriceTypeFilter,
    hasActiveFilters,
    clearAllFilters,
  } = useMyRequestsPage()

  const stageCounts = useMemo(() => {
    const counts: Record<PostedTaskListFilter, number> = {
      all: activeRows.length,
      quoting: 0,
      booked: 0,
    }
    for (const row of activeRows) {
      const stage = postedTaskStage(row.task, row.customerOrder)
      if (stage === 'quoting' || stage === 'draft') counts.quoting += 1
      else if (stage === 'booked') counts.booked += 1
    }
    return counts
  }, [activeRows])

  return (
    <Stack
      gap={5}
      p={4}
      borderRadius="xl"
      bg="cardBg"
      borderWidth="1px"
      borderColor="cardBorder"
    >
      <Stack gap={2}>
        <Text {...SECTION_LABEL}>Status</Text>
        <Stack gap={1.5}>
          <Button
            type="button"
            size="sm"
            w="full"
            justifyContent="space-between"
            variant={tab === 'active' ? 'primary' : 'ghost'}
            onClick={() => setTab('active')}
          >
            <Text>In progress</Text>
            <Text opacity={tab === 'active' ? 0.9 : 0.7}>
              ({activeRows.length})
            </Text>
          </Button>
          <Button
            type="button"
            size="sm"
            w="full"
            justifyContent="space-between"
            variant={tab === 'completed' ? 'primary' : 'ghost'}
            onClick={() => setTab('completed')}
          >
            <Text>Completed</Text>
            <Text opacity={tab === 'completed' ? 0.9 : 0.7}>
              ({completedRows.length})
            </Text>
          </Button>
        </Stack>
      </Stack>

      {tab === 'active' ? (
        <Stack gap={2}>
          <Text {...SECTION_LABEL}>Stage</Text>
          <Stack gap={1.5}>
            {STAGE_FILTERS.map((key) => {
              const n = stageCounts[key]
              if (n === 0 && stageFilter !== key && key !== 'all') return null
              const active = stageFilter === key
              return (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  w="full"
                  justifyContent="space-between"
                  variant={active ? 'primary' : 'ghost'}
                  onClick={() => setStageFilter(key)}
                >
                  <Text>{postedTaskFilterLabel(key)}</Text>
                  <Text opacity={active ? 0.9 : 0.7}>({n})</Text>
                </Button>
              )
            })}
          </Stack>
        </Stack>
      ) : null}

      <Stack gap={0}>
        <FilterAccordion title="Category">
          <Select
            value={inboxFilters.category}
            aria-label="Filter by category"
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              inboxFilters.setCategory(e.target.value)
            }
          >
            <option value="">All categories</option>
            {TASK_CREATE_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterAccordion>

        <FilterAccordion title="Location">
          <Input
            value={locationFilter}
            placeholder="Area or postcode"
            aria-label="Filter by location"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLocationFilter(e.target.value)
            }
          />
        </FilterAccordion>

        <FilterAccordion title="Price type">
          <Select
            value={priceTypeFilter}
            aria-label="Filter by price type"
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setPriceTypeFilter(e.target.value)
            }
          >
            {PRICE_TYPE_OPTIONS.map((option) => (
              <option key={option.value || 'any'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterAccordion>

        <FilterAccordion title="Date posted">
          <Stack gap={2}>
            <Input
              type="date"
              value={inboxFilters.createdAfter}
              aria-label="Posted on or after"
              max={inboxFilters.createdBefore || undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                inboxFilters.setCreatedAfter(e.target.value)
              }
            />
            <Input
              type="date"
              value={inboxFilters.createdBefore}
              aria-label="Posted on or before"
              min={inboxFilters.createdAfter || undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                inboxFilters.setCreatedBefore(e.target.value)
              }
            />
          </Stack>
        </FilterAccordion>

        <FilterAccordion title="Sort">
          <Select
            value={inboxFilters.sort}
            aria-label="Sort requests"
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              inboxFilters.setSort(e.target.value as InboxSortChoice)
            }
          >
            {INBOX_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FilterAccordion>
      </Stack>

      {hasActiveFilters ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={clearAllFilters}
        >
          Clear filters
        </Button>
      ) : null}
    </Stack>
  )
}

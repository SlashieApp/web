'use client'

import {
  Box,
  HStack,
  Input,
  NativeSelect,
  SimpleGrid,
  Slider,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Button } from '@ui'

import {
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import type { TaskBrowseFiltersProps } from '../../helpers/taskBrowseFilters.types'

import { TaskList } from './TaskList'

export type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../../helpers/taskBrowseFilters.types'

export type TaskBrowseFiltersPanelProps = Omit<
  TaskBrowseFiltersProps,
  'variant' | 'showMapPromo'
>

const FILTER_LABEL = {
  fontSize: 'xs',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'formLabelMuted',
  textTransform: 'uppercase' as const,
}

function FilterSectionTitle({
  children,
  mb = 2,
}: {
  children: React.ReactNode
  mb?: number
}) {
  return (
    <Text {...FILTER_LABEL} mb={mb}>
      {children}
    </Text>
  )
}

/** Compact filter panel (web sidebar). */
export function TaskBrowseFiltersCompactPanel({
  radiusMiles,
  onRadiusChange,
  minBudgetPounds,
  maxBudgetPounds,
  onMinBudgetChange,
  onMaxBudgetChange,
  sortValue = 'nearest',
  sortOptions = [],
  onSortChange,
}: TaskBrowseFiltersPanelProps) {
  const budgetPresets = ['50', '100', '500']
  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <FilterSectionTitle mb={1}>Search radius</FilterSectionTitle>
        <Slider.Root
          min={1}
          max={50}
          step={1}
          value={[Math.min(50, Math.max(1, radiusMiles))]}
          onValueChange={(d) => {
            const next = d.value[0]
            if (typeof next === 'number') onRadiusChange(next)
          }}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </Stack>

      <Stack gap={2}>
        <FilterSectionTitle mb={1}>Sort</FilterSectionTitle>
        <NativeSelect.Root>
          <NativeSelect.Field
            aria-label="Sort tasks"
            value={sortValue}
            onChange={(e) => onSortChange?.(e.target.value)}
            bg="neutral.100"
            borderWidth="1px"
            borderColor="jobCardBorder"
            borderRadius="lg"
            fontSize="sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Stack>

      <Stack gap={2}>
        <FilterSectionTitle mb={1}>Budget range</FilterSectionTitle>
        <SimpleGrid columns={2} gap={2}>
          <Input
            inputMode="decimal"
            placeholder="$50"
            value={minBudgetPounds}
            onChange={(e) => onMinBudgetChange(e.target.value)}
          />
          <Input
            inputMode="decimal"
            placeholder="$500+"
            value={maxBudgetPounds}
            onChange={(e) => onMaxBudgetChange(e.target.value)}
          />
        </SimpleGrid>
        <HStack gap={2} flexWrap="wrap">
          {budgetPresets.map((value) => (
            <Button
              key={value}
              type="button"
              size="xs"
              variant="secondary"
              onClick={() => {
                onMinBudgetChange(value)
                onMaxBudgetChange('')
              }}
            >
              £{value}
            </Button>
          ))}
        </HStack>
      </Stack>
    </Stack>
  )
}

/** Full default filter panel (web). */
export function TaskBrowseFiltersDefaultPanel({
  searchQuery,
  onSearchChange,
  areaLocationInput = '',
  onAreaLocationChange = () => {},
  onAreaLocationCommit,
  radiusMiles,
  onRadiusChange,
  minBudgetPounds,
  maxBudgetPounds,
  onMinBudgetChange,
  onMaxBudgetChange,
  urgency,
  onUrgencyChange,
}: TaskBrowseFiltersPanelProps) {
  return (
    <Stack gap={6}>
      <Stack gap={3}>
        <FilterSectionTitle>Search</FilterSectionTitle>
        <Input
          type="search"
          placeholder="Title, description, keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Stack>

      <Stack gap={3}>
        <FilterSectionTitle>Search area</FilterSectionTitle>
        <Input
          type="search"
          placeholder="e.g. Shoreditch, London or postcode"
          value={areaLocationInput}
          onChange={(e) => onAreaLocationChange(e.target.value)}
          onBlur={() => onAreaLocationCommit?.()}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAreaLocationCommit?.()
          }}
        />
      </Stack>

      <Stack gap={3}>
        <HStack justify="space-between" align="baseline">
          <FilterSectionTitle mb={0}>Radius</FilterSectionTitle>
          <Text fontSize="sm" fontWeight={700}>
            {radiusMiles} miles
          </Text>
        </HStack>
        <Slider.Root
          min={1}
          max={500}
          step={1}
          value={[radiusMiles]}
          onValueChange={(d) => {
            const next = d.value[0]
            if (typeof next === 'number') onRadiusChange(next)
          }}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </Stack>

      <Stack gap={3}>
        <FilterSectionTitle>Budget range</FilterSectionTitle>
        <SimpleGrid columns={2} gap={3}>
          <Input
            inputMode="decimal"
            placeholder="0"
            value={minBudgetPounds}
            onChange={(e) => onMinBudgetChange(e.target.value)}
          />
          <Input
            inputMode="decimal"
            placeholder="Any"
            value={maxBudgetPounds}
            onChange={(e) => onMaxBudgetChange(e.target.value)}
          />
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}

export function TaskBrowseFilters({
  variant = 'default',
  ...props
}: TaskBrowseFiltersProps) {
  if (variant === 'compact') {
    return (
      <Box
        borderRadius="xl"
        bg="jobCardBg"
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
      bg="jobCardBg"
      p={{ base: 5, md: 6 }}
      boxShadow="ghostBorder"
    >
      <TaskBrowseFiltersDefaultPanel {...props} />
    </Box>
  )
}

/**
 * Web task browse: when filters are open, this panel occupies the same flex
 * region as `TaskList`; otherwise the list is shown.
 */
export function WebTaskBrowseFiltersBlock() {
  const { isFilterOpen } = useTaskBrowseLayout()
  const filterProps = useTaskBrowseFiltersProps('compact')

  return (
    <Box flex={1} minH={0} mb={6} pointerEvents="none">
      {isFilterOpen ? (
        <Box h="full" overflowY="auto" pr={{ base: 1, md: 0 }}>
          <TaskBrowseFilters {...filterProps} />
        </Box>
      ) : (
        <TaskList />
      )}
    </Box>
  )
}

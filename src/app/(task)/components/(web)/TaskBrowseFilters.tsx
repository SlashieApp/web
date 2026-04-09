'use client'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import {
  Box,
  Checkbox,
  HStack,
  NativeSelect,
  SimpleGrid,
  Slider,
  Stack,
} from '@chakra-ui/react'
import type { TaskCategory } from '@codegen/schema'
import { Button, Heading, Text, TextInput } from '@ui'

const FILTER_LABEL = {
  fontSize: 'xs',
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: 'muted',
  textTransform: 'uppercase' as const,
}

export type UrgencyFilter = 'any' | 'emergency' | 'today' | 'week'

export type TaskBrowseFiltersProps = {
  categories: readonly TaskCategory[]
  selectedCategories: Set<TaskCategory>
  onToggleCategory: (category: TaskCategory, checked: boolean) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  areaLocationInput?: string
  onAreaLocationChange?: (value: string) => void
  onAreaLocationCommit?: () => void
  radiusMiles: number
  onRadiusChange: (miles: number) => void
  minBudgetPounds: string
  maxBudgetPounds: string
  onMinBudgetChange: (value: string) => void
  onMaxBudgetChange: (value: string) => void
  urgency: UrgencyFilter
  onUrgencyChange: (value: UrgencyFilter) => void
  sortValue?: string
  sortOptions?: readonly { value: string; label: string }[]
  onSortChange?: (value: string) => void
  showMapPromo?: boolean
  variant?: 'default' | 'compact'
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

function UrgencyPill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  const isEmergency = label === 'Emergency'
  return (
    <Button
      type="button"
      size="sm"
      variant="subtle"
      flex="1"
      minW="0"
      fontSize="sm"
      fontWeight={600}
      borderRadius="full"
      boxShadow="none"
      bg={
        active
          ? isEmergency
            ? 'secondaryFixed'
            : 'primary.500'
          : 'surfaceContainerHigh'
      }
      color={active ? (isEmergency ? 'onSecondaryFixed' : 'white') : 'fg'}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export function TaskBrowseFilters({
  categories,
  selectedCategories,
  onToggleCategory,
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
  sortValue = 'nearest',
  sortOptions = [],
  onSortChange,
  variant = 'default',
}: TaskBrowseFiltersProps) {
  if (variant === 'compact') {
    const compactCategories = categories.slice(0, 4)
    const budgetPresets = ['50', '100', '500']
    return (
      <Box
        borderRadius="xl"
        bg="surfaceContainerLow"
        p={{ base: 3, md: 4 }}
        boxShadow="ghostBorder"
      >
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
                bg="surfaceContainerLowest"
                borderWidth="1px"
                borderColor="border"
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
            <FilterSectionTitle mb={1}>Category</FilterSectionTitle>
            <SimpleGrid columns={2} gap={2}>
              {compactCategories.map((cat) => {
                const active = selectedCategories.has(cat)
                return (
                  <Button
                    key={cat}
                    type="button"
                    size="sm"
                    variant={active ? 'solid' : 'subtle'}
                    justifyContent="flex-start"
                    onClick={() => onToggleCategory(cat, !active)}
                  >
                    {formatTaskCategoryLabel(cat)}
                  </Button>
                )
              })}
            </SimpleGrid>
          </Stack>

          <Stack gap={2}>
            <FilterSectionTitle mb={1}>Budget range</FilterSectionTitle>
            <SimpleGrid columns={2} gap={2}>
              <TextInput
                inputMode="decimal"
                placeholder="$50"
                value={minBudgetPounds}
                onChange={(e) => onMinBudgetChange(e.target.value)}
              />
              <TextInput
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
                  variant="subtle"
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
      </Box>
    )
  }

  return (
    <Box
      borderRadius="xl"
      bg="surfaceContainerLow"
      p={{ base: 5, md: 6 }}
      boxShadow="ghostBorder"
    >
      <Stack gap={6}>
        <Stack gap={3}>
          <FilterSectionTitle>Search</FilterSectionTitle>
          <TextInput
            type="search"
            placeholder="Title, description, keywords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </Stack>

        <Stack gap={3}>
          <FilterSectionTitle>Search area</FilterSectionTitle>
          <TextInput
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
          <FilterSectionTitle>Category</FilterSectionTitle>
          <Stack gap={2.5}>
            {categories.map((cat) => (
              <Checkbox.Root
                key={cat}
                checked={selectedCategories.has(cat)}
                onCheckedChange={(detail) =>
                  onToggleCategory(cat, Boolean(detail.checked))
                }
              >
                <Checkbox.HiddenInput />
                <HStack gap={3} align="center">
                  <Checkbox.Control />
                  <Checkbox.Label>
                    {formatTaskCategoryLabel(cat)}
                  </Checkbox.Label>
                </HStack>
              </Checkbox.Root>
            ))}
          </Stack>
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
            <TextInput
              inputMode="decimal"
              placeholder="0"
              value={minBudgetPounds}
              onChange={(e) => onMinBudgetChange(e.target.value)}
            />
            <TextInput
              inputMode="decimal"
              placeholder="Any"
              value={maxBudgetPounds}
              onChange={(e) => onMaxBudgetChange(e.target.value)}
            />
          </SimpleGrid>
        </Stack>

        <Stack gap={3}>
          <FilterSectionTitle>Urgency</FilterSectionTitle>
          <HStack gap={2} flexWrap="wrap">
            <UrgencyPill
              label="Emergency"
              active={urgency === 'emergency'}
              onClick={() =>
                onUrgencyChange(urgency === 'emergency' ? 'any' : 'emergency')
              }
            />
            <UrgencyPill
              label="Today"
              active={urgency === 'today'}
              onClick={() =>
                onUrgencyChange(urgency === 'today' ? 'any' : 'today')
              }
            />
            <UrgencyPill
              label="This week"
              active={urgency === 'week'}
              onClick={() =>
                onUrgencyChange(urgency === 'week' ? 'any' : 'week')
              }
            />
          </HStack>
        </Stack>
      </Stack>
    </Box>
  )
}

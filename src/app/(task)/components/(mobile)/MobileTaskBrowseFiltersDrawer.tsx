'use client'

import { Box, HStack, Slider, Stack, Text } from '@chakra-ui/react'
import { AppDrawer, Button } from '@ui'

import {
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../../helpers/taskBrowseFilters.types'

const CATEGORY_OPTIONS = [
  'Delivery',
  'Handyman',
  'Tech Setup',
  'Cleaning',
  'Moving',
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      fontSize="xs"
      fontWeight={700}
      letterSpacing="0.06em"
      color="formLabelMuted"
      textTransform="uppercase"
    >
      {children}
    </Text>
  )
}

function milesToKm(miles: number): number {
  return Math.round(miles * 1.60934)
}

function kmToMiles(km: number): number {
  return Math.max(1, Math.round(km / 1.60934))
}

function formatBudgetRange(minBudgetPounds: string, maxBudgetPounds: string) {
  const min = Number.parseFloat(minBudgetPounds)
  const max = Number.parseFloat(maxBudgetPounds)
  const minLabel = Number.isFinite(min) ? `$${Math.round(min)}` : '$0'
  const maxLabel = Number.isFinite(max) ? `$${Math.round(max)}` : '$150+'
  return `${minLabel} - ${maxLabel}`
}

function MobileBrowseFiltersSheetBody(props: TaskBrowseFiltersProps) {
  const {
    showMapPromo: _showMapPromo,
    sortValue: _sort,
    sortOptions: _sortOptions,
    onSortChange: _onSortChange,
    radiusMiles,
    onRadiusChange,
    minBudgetPounds,
    maxBudgetPounds,
    onMinBudgetChange,
    onMaxBudgetChange,
    urgency,
    onUrgencyChange,
  } = props

  const radiusKm = milesToKm(Math.min(50, Math.max(1, radiusMiles)))
  const budgetLabel = formatBudgetRange(minBudgetPounds, maxBudgetPounds)

  return (
    <Stack gap={6} pb={2}>
      <Stack gap={3}>
        <SectionLabel>Category</SectionLabel>
        <HStack gap={2} flexWrap="wrap">
          {CATEGORY_OPTIONS.map((category, idx) => (
            <Button
              key={category}
              size="sm"
              variant={idx === 0 ? 'primary' : 'secondary'}
              borderRadius="full"
            >
              {category}
            </Button>
          ))}
        </HStack>
      </Stack>

      <Stack gap={3}>
        <HStack justify="space-between" align="baseline">
          <SectionLabel>Budget</SectionLabel>
          <Text fontSize="sm" fontWeight={800} color="primary.600">
            {budgetLabel}
          </Text>
        </HStack>
        <Slider.Root
          min={0}
          max={150}
          step={1}
          value={[
            Number.isFinite(Number.parseFloat(minBudgetPounds))
              ? Number.parseFloat(minBudgetPounds)
              : 0,
            Number.isFinite(Number.parseFloat(maxBudgetPounds))
              ? Number.parseFloat(maxBudgetPounds)
              : 150,
          ]}
          onValueChange={(d) => {
            const [nextMin, nextMax] = d.value
            if (typeof nextMin === 'number') {
              onMinBudgetChange(String(Math.round(nextMin)))
            }
            if (typeof nextMax === 'number') {
              onMaxBudgetChange(
                nextMax >= 150 ? '' : String(Math.round(nextMax)),
              )
            }
          }}
        >
          <Slider.Control>
            <Slider.Track bg="cardDivider">
              <Slider.Range bg="primary.600" />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </Stack>

      <Stack gap={3}>
        <HStack justify="space-between" align="baseline">
          <SectionLabel>Distance</SectionLabel>
          <Text fontSize="sm" fontWeight={800} color="primary.600">
            {radiusKm} km
          </Text>
        </HStack>
        <Slider.Root
          min={1}
          max={80}
          step={1}
          value={[radiusKm]}
          onValueChange={(d) => {
            const next = d.value[0]
            if (typeof next === 'number') onRadiusChange(kmToMiles(next))
          }}
        >
          <Slider.Control>
            <Slider.Track bg="cardDivider">
              <Slider.Range bg="primary.600" />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Urgency</SectionLabel>
        <Stack gap={2}>
          {[
            {
              value: 'emergency' as UrgencyFilter,
              label: 'ASAP (Next 2 hours)',
            },
            { value: 'today' as UrgencyFilter, label: 'Today' },
            { value: 'week' as UrgencyFilter, label: 'Flexible' },
          ].map((option) => {
            const active = urgency === option.value
            return (
              <Button
                key={option.value}
                variant={active ? 'secondary' : 'ghost'}
                size="md"
                justifyContent="flex-start"
                borderRadius="lg"
                borderWidth="1px"
                borderColor={active ? 'primary.600' : 'cardBorder'}
                bg={active ? 'primary.50' : 'transparent'}
                onClick={() => onUrgencyChange(option.value)}
              >
                <Box
                  as="span"
                  w={4}
                  h={4}
                  borderRadius="full"
                  borderWidth="2px"
                  borderColor={active ? 'primary.600' : 'formControlBorder'}
                  mr={2.5}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {active ? (
                    <Box
                      as="span"
                      w={2}
                      h={2}
                      borderRadius="full"
                      bg="primary.600"
                    />
                  ) : null}
                </Box>
                {option.label}
              </Button>
            )
          })}
        </Stack>
      </Stack>
    </Stack>
  )
}

/** Opens / toggles the mobile filter drawer; owns layout `isFilterOpen` subscription so `MobileLayout` does not. */
export function MobileTaskBrowseFiltersTrigger() {
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()
  return (
    <Button
      type="button"
      size="sm"
      variant={isFilterOpen ? 'primary' : 'secondary'}
      px={2.5}
      py={1}
      onClick={() => setIsFilterOpen(!isFilterOpen)}
      pointerEvents="auto"
    >
      Filters
    </Button>
  )
}

/**
 * Mobile task browse: bottom sheet (handle, rounded top, scrollable filter
 * fields, apply footer). Map and carousel stay mounted underneath.
 */
export function MobileTaskBrowseFiltersDrawer() {
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()
  const filterProps = useTaskBrowseFiltersProps()

  return (
    <AppDrawer
      open={isFilterOpen}
      onOpenChange={setIsFilterOpen}
      title="Filters"
      placement="bottom"
      size="full"
      primaryActionLabel="Apply filters"
      onPrimaryAction={() => setIsFilterOpen(false)}
    >
      <MobileBrowseFiltersSheetBody {...filterProps} />
    </AppDrawer>
  )
}

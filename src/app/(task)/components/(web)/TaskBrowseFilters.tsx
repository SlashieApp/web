'use client'

import { Box, HStack, SimpleGrid, Slider, Stack, Text } from '@chakra-ui/react'
import { Button, Input as UiInput } from '@ui'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuLocateFixed, LuSearch } from 'react-icons/lu'

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
  'showMapPromo'
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

export function TaskBrowseFiltersPanel({
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
  urgency: _urgency,
  onUrgencyChange: _onUrgencyChange,
}: TaskBrowseFiltersProps) {
  return (
    <Stack gap={6}>
      <Stack gap={3}>
        <FilterSectionTitle>Search</FilterSectionTitle>
        <UiInput
          startElement={
            <Box as="span" aria-hidden display="inline-flex">
              <LuSearch size={18} strokeWidth={2} />
            </Box>
          }
          type="text"
          inputMode="search"
          autoComplete="off"
          placeholder="Title, description, keywords..."
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
        />
      </Stack>

      <Stack gap={3}>
        <FilterSectionTitle>Search area</FilterSectionTitle>
        <UiInput
          startElement={
            <Box as="span" aria-hidden display="inline-flex">
              <LuSearch size={18} strokeWidth={2} />
            </Box>
          }
          endElement={
            <Button
              aria-label="Use current location"
              title="Use current location"
              display="flex"
              alignItems="center"
              justifyContent="center"
              minW={0}
              w={8}
              h={8}
              px={0}
              py={0}
              variant="ghost"
              color="formControlIcon"
              _hover={{ bg: 'badgeBg', color: 'cardFg' }}
              _focusVisible={{
                outline: '2px solid',
                outlineColor: 'secondary',
                outlineOffset: '2px',
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!navigator.geolocation) return
                navigator.geolocation.getCurrentPosition((position) => {
                  const lat = position.coords.latitude.toFixed(5)
                  const lng = position.coords.longitude.toFixed(5)
                  onAreaLocationChange(`${lat}, ${lng}`)
                  onAreaLocationCommit?.()
                })
              }}
            >
              <LuLocateFixed size={18} strokeWidth={2} aria-hidden />
            </Button>
          }
          type="text"
          inputMode="search"
          autoComplete="off"
          placeholder="London, UK"
          value={areaLocationInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onAreaLocationChange(e.target.value)
          }
          onBlur={() => onAreaLocationCommit?.()}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
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
          <UiInput
            rootProps={{ minH: 12, borderRadius: 'lg' }}
            startElement={
              <Text color="formLabelMuted" fontSize="sm" fontWeight={600}>
                £
              </Text>
            }
            inputMode="decimal"
            placeholder="0"
            value={minBudgetPounds}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onMinBudgetChange(e.target.value)
            }
          />
          <UiInput
            rootProps={{ minH: 12, borderRadius: 'lg' }}
            startElement={
              <Text color="formLabelMuted" fontSize="sm" fontWeight={600}>
                £
              </Text>
            }
            inputMode="decimal"
            placeholder="Any"
            value={maxBudgetPounds}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onMaxBudgetChange(e.target.value)
            }
          />
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}

export function TaskBrowseFilters({ ...props }: TaskBrowseFiltersProps) {
  return (
    <Box
      borderRadius="xl"
      bg="cardBg"
      p={{ base: 3, md: 4 }}
      boxShadow="ghostBorder"
    >
      <TaskBrowseFiltersPanel {...props} />
    </Box>
  )
}

/**
 * Web task browse: when filters are open, this panel occupies the same flex
 * region as `TaskList`; otherwise the list is shown.
 */
export function WebTaskBrowseFiltersBlock() {
  const { isFilterOpen } = useTaskBrowseLayout()
  const filterProps = useTaskBrowseFiltersProps()

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

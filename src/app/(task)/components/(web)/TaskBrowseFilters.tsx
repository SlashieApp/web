'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import {
  Button,
  Card,
  IconButton,
  RadioButton,
  Slider,
  Input as UiInput,
} from '@ui'
import { AnimatePresence, motion } from 'motion/react'
import type { ChangeEvent } from 'react'
import { LuX } from 'react-icons/lu'

import {
  useTaskBrowseData,
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import type { TaskBrowseFiltersProps } from '../../helpers/taskBrowseFilters.types'
import type { UrgencyFilter } from '../../helpers/taskBrowseFilters.types'

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

const CATEGORY_OPTIONS = [
  'Delivery',
  'Handyman',
  'Tech Setup',
  'Cleaning',
  'Moving',
]

function formatBudgetRange(minBudgetPounds: string, maxBudgetPounds: string) {
  const min = Number.parseFloat(minBudgetPounds)
  const max = Number.parseFloat(maxBudgetPounds)
  const minLabel = Number.isFinite(min) ? `$${Math.round(min)}` : '$0'
  const maxLabel = Number.isFinite(max) ? `$${Math.round(max)}` : '$150+'
  return `${minLabel} - ${maxLabel}`
}

function milesToKm(miles: number): number {
  return Math.round(miles * 1.60934)
}

function kmToMiles(km: number): number {
  return Math.max(1, Math.round(km / 1.60934))
}

export function TaskBrowseFiltersPanel({
  radiusMiles,
  onRadiusChange,
  minBudgetPounds,
  maxBudgetPounds,
  onMinBudgetChange,
  onMaxBudgetChange,
  urgency: _urgency,
  onUrgencyChange: _onUrgencyChange,
}: TaskBrowseFiltersProps) {
  const radiusKm = milesToKm(radiusMiles)
  const budgetLabel = formatBudgetRange(minBudgetPounds, maxBudgetPounds)

  return (
    <Stack gap={6}>
      <Stack gap={3}>
        <FilterSectionTitle>Category</FilterSectionTitle>
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
          <FilterSectionTitle mb={0}>Budget</FilterSectionTitle>
          <Text fontSize="sm" fontWeight={700} color="primary.600">
            {budgetLabel}
          </Text>
        </HStack>
        <Slider
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
        />
      </Stack>

      <Stack gap={3}>
        <HStack justify="space-between" align="baseline">
          <FilterSectionTitle mb={0}>Distance</FilterSectionTitle>
          <Text fontSize="sm" fontWeight={700} color="primary.600">
            {radiusKm} km
          </Text>
        </HStack>
        <Slider
          min={1}
          max={80}
          step={1}
          value={[radiusKm]}
          onValueChange={(d) => {
            const next = d.value[0]
            if (typeof next === 'number') onRadiusChange(kmToMiles(next))
          }}
        />
      </Stack>

      <Stack gap={3}>
        <FilterSectionTitle>Urgency</FilterSectionTitle>
        <Stack gap={2} role="radiogroup" aria-label="Urgency">
          {[
            {
              value: 'emergency' as UrgencyFilter,
              label: 'ASAP (Next 2 hours)',
            },
            { value: 'today' as UrgencyFilter, label: 'Today' },
            { value: 'week' as UrgencyFilter, label: 'Flexible' },
          ].map((option) => {
            const active = _urgency === option.value
            return (
              <RadioButton
                key={option.value}
                checked={active}
                label={option.label}
                onChange={() => _onUrgencyChange(option.value)}
              />
            )
          })}
        </Stack>
      </Stack>

      <Stack gap={3}>
        <FilterSectionTitle>Budget inputs</FilterSectionTitle>
        <HStack gap={3}>
          <UiInput
            rootProps={{ minH: 11, borderRadius: 'lg' }}
            inputMode="decimal"
            placeholder="Min"
            value={minBudgetPounds}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onMinBudgetChange(e.target.value)
            }
          />
          <UiInput
            rootProps={{ minH: 11, borderRadius: 'lg' }}
            inputMode="decimal"
            placeholder="Max"
            value={maxBudgetPounds}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onMaxBudgetChange(e.target.value)
            }
          />
        </HStack>
      </Stack>
    </Stack>
  )
}

export function TaskBrowseFilters({ ...props }: TaskBrowseFiltersProps) {
  const { submitBrowseFilters } = useTaskBrowseData()
  const { setIsFilterOpen } = useTaskBrowseLayout()

  const dismissFilters = () => {
    setIsFilterOpen(false)
  }

  const submitAndDismiss = () => {
    submitBrowseFilters()
    setIsFilterOpen(false)
  }

  return (
    <Card
      position="relative"
      w="full"
      maxW="full"
      p={{ base: 3, md: 4 }}
      boxShadow="ghostBorder"
      pointerEvents="auto"
    >
      <Box position="absolute" top={2} right={2} zIndex={1}>
        <IconButton
          type="button"
          variant="ghost"
          aria-label="Close filters"
          size="sm"
          onClick={dismissFilters}
        >
          <LuX size={18} strokeWidth={2} />
        </IconButton>
      </Box>

      <Stack gap={6} pt={1}>
        <TaskBrowseFiltersPanel {...props} />
        <Button
          type="button"
          w="full"
          variant="primary"
          onClick={submitAndDismiss}
        >
          Apply filters
        </Button>
      </Stack>
    </Card>
  )
}

/**
 * Web task browse: when filters are open, this panel occupies the same flex
 * region as `TaskList`; otherwise the list is shown.
 */
const filterPanelEase = [0.22, 1, 0.36, 1] as const
/** Shared horizontal slide distance (px): enter from left (−), exit to right (+). */
const browsePanelSlidePx = 22

export function WebTaskBrowseFiltersBlock() {
  const { isFilterOpen } = useTaskBrowseLayout()
  const filterProps = useTaskBrowseFiltersProps()

  return (
    <Box
      flex={1}
      minH={0}
      mb={6}
      w="full"
      pointerEvents="none"
      display="flex"
      flexDirection="column"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isFilterOpen ? (
          <motion.div
            key="task-browse-filters"
            initial={{ opacity: 0, x: -browsePanelSlidePx }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: browsePanelSlidePx }}
            transition={{ duration: 0.32, ease: filterPanelEase }}
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box flex={1} minH={0} w="full" overflowY="auto">
              <TaskBrowseFilters {...filterProps} />
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="task-browse-list"
            initial={{ opacity: 0, x: -browsePanelSlidePx }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: browsePanelSlidePx }}
            transition={{ duration: 0.26, ease: filterPanelEase }}
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TaskList />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}

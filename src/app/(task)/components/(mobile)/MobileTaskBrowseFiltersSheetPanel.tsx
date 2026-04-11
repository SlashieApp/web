'use client'

import type { ReactNode } from 'react'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import {
  Box,
  Button as ChakraButton,
  HStack,
  InputGroup,
  SimpleGrid,
  Slider,
  Stack,
  Text,
} from '@chakra-ui/react'
import { TaskCategory } from '@codegen/schema'
import { Button, IconCalendar, IconWrench, TextInput } from '@ui'

import type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../taskBrowseFilters.types'

function CategoryFilterIcon({ category }: { category: TaskCategory }) {
  const stroke = 'currentColor'
  const common = { width: '22px', height: '22px', flexShrink: 0 } as const
  switch (category) {
    case TaskCategory.Plumbing:
      return (
        <Box as="span" {...common} display="inline-flex" alignItems="center">
          <IconWrench w="22px" h="22px" color="inherit" />
        </Box>
      )
    case TaskCategory.Electrical:
      return (
        <Box as="span" {...common} display="inline-flex" alignItems="center">
          <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
            <title>Electrical</title>
            <path
              d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z"
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        </Box>
      )
    case TaskCategory.Painting:
      return (
        <Box as="span" {...common} display="inline-flex" alignItems="center">
          <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
            <title>Painting</title>
            <path
              d="M4 21h10a2 2 0 0 0 2-2v-3H4v5Z"
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M18 3v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V3"
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path
              d="M12 3v8M9 6h6"
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </Box>
      )
    case TaskCategory.Gardening:
      return (
        <Box as="span" {...common} display="inline-flex" alignItems="center">
          <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
            <title>Gardening</title>
            <path
              d="M12 22c-4-4-6-8-6-12a6 6 0 0 1 12 0c0 4-2 8-6 12Z"
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              d="M12 22V10"
              stroke={stroke}
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </Box>
      )
    default:
      return (
        <Box as="span" {...common} display="inline-flex" alignItems="center">
          <IconWrench w="22px" h="22px" color="inherit" />
        </Box>
      )
  }
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text fontSize="sm" fontWeight={600} color="muted">
      {children}
    </Text>
  )
}

function IconEmergencyDiamond(props: { color?: string }) {
  const c = props.color ?? 'currentColor'
  return (
    <Box as="span" w="22px" h="22px" display="inline-flex" alignItems="center">
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Emergency</title>
        <path
          d="M12 4 20 12 12 20 4 12 12 4Z"
          stroke={c}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M12 8v5M12 16h.01"
          stroke={c}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

type UrgencyCardProps = {
  label: string
  active: boolean
  onClick: () => void
  icon: ReactNode
  accent?: 'emergency'
}

function UrgencyCard({
  label,
  active,
  onClick,
  icon,
  accent,
}: UrgencyCardProps) {
  const isEmergency = accent === 'emergency'
  return (
    <ChakraButton
      type="button"
      variant="outline"
      flex="1"
      minW={0}
      h="auto"
      py={3}
      px={2}
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={1.5}
      fontWeight={800}
      fontSize="10px"
      letterSpacing="0.04em"
      whiteSpace="normal"
      lineHeight="1.1"
      borderWidth="1px"
      bg={
        active
          ? isEmergency
            ? 'secondaryFixed'
            : 'primary.50'
          : 'surfaceContainerHigh'
      }
      borderColor={
        active ? (isEmergency ? 'secondary.400' : 'primary.500') : 'transparent'
      }
      color={
        active ? (isEmergency ? 'onSecondaryFixed' : 'primary.600') : 'muted'
      }
      boxShadow="none"
      _hover={{
        bg: active
          ? isEmergency
            ? 'secondary.100'
            : 'primary.100'
          : 'surfaceContainerHighest',
      }}
      onClick={onClick}
      aria-pressed={active}
    >
      {icon}
      <Text as="span" textAlign="center">
        {label}
      </Text>
    </ChakraButton>
  )
}

function cycleUrgency(
  current: UrgencyFilter,
  target: UrgencyFilter,
): UrgencyFilter {
  return current === target ? 'any' : target
}

/** Mobile filter sheet body — matches browse filters design (categories, radius, budget, urgency). */
export function MobileTaskBrowseFiltersSheetPanel(
  props: TaskBrowseFiltersProps,
) {
  const {
    variant: _variant,
    showMapPromo: _showMapPromo,
    sortValue: _sort,
    sortOptions: _sortOptions,
    onSortChange: _onSortChange,
    categories,
    selectedCategories,
    onToggleCategory,
    radiusMiles,
    onRadiusChange,
    minBudgetPounds,
    maxBudgetPounds,
    onMinBudgetChange,
    onMaxBudgetChange,
    urgency,
    onUrgencyChange,
  } = props

  const compactCategories = categories.slice(0, 4)
  const radius = Math.min(50, Math.max(1, radiusMiles))

  return (
    <Stack gap={6} pb={2}>
      <Stack gap={3}>
        <SectionLabel>Categories</SectionLabel>
        <SimpleGrid columns={2} gap={2.5}>
          {compactCategories.map((cat) => {
            const active = selectedCategories.has(cat)
            return (
              <Button
                key={cat}
                type="button"
                size="lg"
                h="auto"
                minH="72px"
                py={3}
                px={3}
                borderRadius="xl"
                justifyContent="flex-start"
                fontWeight={700}
                fontSize="sm"
                gap={2.5}
                boxShadow="none"
                bg={active ? 'primary.600' : 'surfaceContainerHigh'}
                color={active ? 'white' : 'primary.600'}
                borderWidth={0}
                _hover={{
                  bg: active ? 'primary.700' : 'surfaceContainerHighest',
                }}
                onClick={() => onToggleCategory(cat, !active)}
              >
                <Box
                  color="inherit"
                  opacity={active ? 1 : 0.85}
                  display="flex"
                  alignItems="center"
                >
                  <CategoryFilterIcon category={cat} />
                </Box>
                {formatTaskCategoryLabel(cat)}
              </Button>
            )
          })}
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <HStack justify="space-between" align="baseline">
          <SectionLabel>Discovery radius</SectionLabel>
          <Text fontSize="sm" fontWeight={800} color="primary.600">
            {radius} miles
          </Text>
        </HStack>
        <Slider.Root
          min={1}
          max={50}
          step={1}
          value={[radius]}
          colorPalette="blue"
          onValueChange={(d) => {
            const next = d.value[0]
            if (typeof next === 'number') onRadiusChange(next)
          }}
        >
          <Slider.Control>
            <Slider.Track bg="surfaceContainerHighest">
              <Slider.Range bg="primary.600" />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
        <HStack justify="space-between">
          <Text
            fontSize="10px"
            fontWeight={700}
            letterSpacing="0.08em"
            color="muted"
          >
            1 MILES
          </Text>
          <Text
            fontSize="10px"
            fontWeight={700}
            letterSpacing="0.08em"
            color="muted"
          >
            50 MILES
          </Text>
        </HStack>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Budget range (£)</SectionLabel>
        <SimpleGrid columns={2} gap={3}>
          <InputGroup
            startElement={
              <Text color="muted" fontSize="sm" fontWeight={600} ps={3}>
                £
              </Text>
            }
          >
            <TextInput
              inputMode="decimal"
              placeholder="Min"
              value={minBudgetPounds}
              onChange={(e) => onMinBudgetChange(e.target.value)}
              h={12}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="outlineVariant"
              ps="2.25rem"
            />
          </InputGroup>
          <InputGroup
            startElement={
              <Text color="muted" fontSize="sm" fontWeight={600} ps={3}>
                £
              </Text>
            }
          >
            <TextInput
              inputMode="decimal"
              placeholder="Max"
              value={maxBudgetPounds}
              onChange={(e) => onMaxBudgetChange(e.target.value)}
              h={12}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="outlineVariant"
              ps="2.25rem"
            />
          </InputGroup>
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Urgency</SectionLabel>
        <HStack gap={2} align="stretch">
          <UrgencyCard
            label="EMERGENCY"
            accent="emergency"
            active={urgency === 'emergency'}
            onClick={() => onUrgencyChange(cycleUrgency(urgency, 'emergency'))}
            icon={<IconEmergencyDiamond />}
          />
          <UrgencyCard
            label="TODAY"
            active={urgency === 'today'}
            onClick={() => onUrgencyChange(cycleUrgency(urgency, 'today'))}
            icon={
              <IconCalendar
                w="22px"
                h="22px"
                color="inherit"
                opacity={urgency === 'today' ? 1 : 0.7}
              />
            }
          />
          <UrgencyCard
            label="THIS WEEK"
            active={urgency === 'week'}
            onClick={() => onUrgencyChange(cycleUrgency(urgency, 'week'))}
            icon={
              <IconCalendar
                w="22px"
                h="22px"
                color="inherit"
                opacity={urgency === 'week' ? 1 : 0.7}
              />
            }
          />
        </HStack>
      </Stack>
    </Stack>
  )
}

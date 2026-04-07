'use client'

import {
  Box,
  Checkbox,
  HStack,
  SimpleGrid,
  Slider,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'

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
  categories: readonly string[]
  selectedCategories: Set<string>
  onToggleCategory: (category: string, checked: boolean) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  /** Place or address for the search center (geocoded). */
  areaLocationInput?: string
  onAreaLocationChange?: (value: string) => void
  /** Called on Enter or blur to geocode the area field immediately. */
  onAreaLocationCommit?: () => void
  radiusMiles: number
  onRadiusChange: (miles: number) => void
  minBudgetPounds: string
  maxBudgetPounds: string
  onMinBudgetChange: (value: string) => void
  onMaxBudgetChange: (value: string) => void
  urgency: UrgencyFilter
  onUrgencyChange: (value: UrgencyFilter) => void
  /** Link for “View map” (e.g. `/map`). */
  mapHref?: string
  /** When false, hides the promotional map card (e.g. map shown elsewhere on the page). */
  showMapPromo?: boolean
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
      _hover={{
        bg: active
          ? isEmergency
            ? 'secondaryFixed'
            : 'primary.600'
          : 'surfaceContainerLowest',
      }}
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
  mapHref = '#',
  showMapPromo = true,
}: TaskBrowseFiltersProps) {
  return (
    <Stack gap={6}>
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
              placeholder="Title, description, keywords…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              bg="surfaceContainerLowest"
              borderWidth="1px"
              borderColor="border"
              borderRadius="lg"
            />
          </Stack>

          <Stack gap={3}>
            <FilterSectionTitle>Search area</FilterSectionTitle>
            <Text fontSize="xs" color="muted" lineHeight="1.45">
              Enter a place or address, or pan the map and tap &nbsp;“Search
              this area” on the map to load tasks within the radius below from
              that center.
            </Text>
            <TextInput
              type="search"
              placeholder="e.g. Shoreditch, London or a postcode"
              value={areaLocationInput}
              onChange={(e) => onAreaLocationChange(e.target.value)}
              onBlur={() => onAreaLocationCommit?.()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAreaLocationCommit?.()
              }}
              bg="surfaceContainerLowest"
              borderWidth="1px"
              borderColor="border"
              borderRadius="lg"
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
                  colorPalette="blue"
                >
                  <Checkbox.HiddenInput />
                  <HStack gap={3} align="center">
                    <Checkbox.Control
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="outlineVariant"
                      bg="surfaceContainerLowest"
                      _checked={{
                        bg: 'primary.500',
                        borderColor: 'primary.500',
                        color: 'white',
                      }}
                    >
                      <Checkbox.Indicator color="inherit" />
                    </Checkbox.Control>
                    <Checkbox.Label fontWeight={500} color="fg">
                      {cat}
                    </Checkbox.Label>
                  </HStack>
                </Checkbox.Root>
              ))}
            </Stack>
          </Stack>

          <Stack gap={3}>
            <HStack justify="space-between" align="baseline">
              <FilterSectionTitle mb={0}>Radius</FilterSectionTitle>
              <Text fontSize="sm" fontWeight={700} color="primary.600">
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
              colorPalette="blue"
            >
              <Slider.Control>
                <Slider.Track
                  bg="surfaceContainerHighest"
                  h="6px"
                  borderRadius="full"
                >
                  <Slider.Range bg="primary.500" borderRadius="full" />
                </Slider.Track>
                <Slider.Thumbs />
              </Slider.Control>
            </Slider.Root>
          </Stack>

          <Stack gap={3}>
            <FilterSectionTitle>Budget range</FilterSectionTitle>
            <SimpleGrid columns={2} gap={3}>
              <Stack gap={1}>
                <Text fontSize="xs" color="muted">
                  Min (£)
                </Text>
                <TextInput
                  inputMode="decimal"
                  placeholder="0"
                  value={minBudgetPounds}
                  onChange={(e) => onMinBudgetChange(e.target.value)}
                  bg="surfaceContainerLowest"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="lg"
                />
              </Stack>
              <Stack gap={1}>
                <Text fontSize="xs" color="muted">
                  Max (£)
                </Text>
                <TextInput
                  inputMode="decimal"
                  placeholder="Any"
                  value={maxBudgetPounds}
                  onChange={(e) => onMaxBudgetChange(e.target.value)}
                  bg="surfaceContainerLowest"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="lg"
                />
              </Stack>
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

      {showMapPromo ? (
        <Box
          borderRadius="xl"
          bg="linear-gradient(160deg, #e6edf9 0%, #d9e6ff 45%, #eef4ff 100%)"
          p={6}
          textAlign="center"
          boxShadow="ghostBorder"
        >
          <Stack gap={4} align="center">
            <Box
              w="full"
              maxW="200px"
              mx="auto"
              aspectRatio={4 / 3}
              borderRadius="lg"
              bg="surfaceContainerLowest"
              boxShadow="card"
              display="grid"
              placeItems="center"
              fontSize="4xl"
              lineHeight={1}
              aria-hidden
            >
              🗺️
            </Box>
            <Stack gap={1}>
              <Heading size="sm">See tasks on a map</Heading>
              <Text fontSize="sm" color="muted">
                Open the full list + Mapbox view. Tasks with coordinates appear
                as pins on the map.
              </Text>
            </Stack>
            <Button
              as={NextLink}
              href={mapHref}
              variant="subtle"
              bg="surfaceContainerLowest"
              color="fg"
              w="full"
              maxW="200px"
            >
              View map
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}

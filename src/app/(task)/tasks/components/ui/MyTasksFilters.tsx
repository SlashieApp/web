'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useCallback, useId, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import { LuSearch, LuSlidersHorizontal } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, IconButton, Input, Select } from '@ui'

import {
  HUB_SECTION_FILTERS,
  type HubSectionFilter,
} from '../../helpers/myTasksHubFilters'
import bag from '../../i11n.json'

export type MyTasksFilterOwner = {
  ownerUserId: string
  label: string
}

export type MyTasksFilterCategory = {
  category: string
  label: string
}

export type MyTasksFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  ownerUserId: string
  onOwnerChange: (ownerUserId: string) => void
  owners: readonly MyTasksFilterOwner[]
  category: string
  onCategoryChange: (category: string) => void
  categories: readonly MyTasksFilterCategory[]
  hubSection: HubSectionFilter | ''
  onHubSectionChange: (section: HubSectionFilter | '') => void
  active: boolean
  onClear: () => void
  /** Open the extra filters on first render (stories and deep links). */
  defaultExpanded?: boolean
}

export function MyTasksFilters({
  search,
  onSearchChange,
  ownerUserId,
  onOwnerChange,
  owners,
  category,
  onCategoryChange,
  categories,
  hubSection,
  onHubSectionChange,
  active,
  onClear,
  defaultExpanded = false,
}: MyTasksFiltersProps) {
  const t = useI11n(bag)
  const filtersId = useId()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const advancedActive = Boolean(ownerUserId || category || hubSection)

  const toggleExpanded = useCallback(() => {
    setExpanded((open) => !open)
  }, [])

  const onSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value)
    },
    [onSearchChange],
  )
  const onOwner = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onOwnerChange(event.target.value)
    },
    [onOwnerChange],
  )
  const onCategory = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      onCategoryChange(event.target.value)
    },
    [onCategoryChange],
  )
  const onSection = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const value = event.currentTarget.dataset.section ?? ''
      onHubSectionChange(value as HubSectionFilter | '')
    },
    [onHubSectionChange],
  )

  const sections: { value: HubSectionFilter | ''; label: string }[] = [
    { value: '', label: t.filters.sectionAll },
    ...HUB_SECTION_FILTERS.map((value) => ({
      value,
      label:
        value === 'OPEN'
          ? t.sections.open
          : value === 'BOOKED'
            ? t.sections.booked
            : t.sections.completed,
    })),
  ]

  return (
    <Stack gap={3}>
      <HStack gap={2} align="stretch">
        <Input
          type="search"
          inputMode="search"
          autoComplete="off"
          value={search}
          placeholder={t.filters.searchPlaceholder}
          aria-label={t.filters.searchLabel}
          onChange={onSearch}
          rootProps={{ flex: '1', minW: 0, borderRadius: 'lg', minH: '48px' }}
          startElement={
            <Box as="span" aria-hidden display="inline-flex" color="text.muted">
              <LuSearch size={18} strokeWidth={2} />
            </Box>
          }
        />
        <IconButton
          type="button"
          variant="ghost"
          aria-label={t.filters.toggle}
          aria-expanded={expanded}
          aria-controls={filtersId}
          aria-pressed={advancedActive}
          onClick={toggleExpanded}
          borderRadius="lg"
          bg={expanded || advancedActive ? 'status.success.soft' : 'bg.surface'}
          color={
            expanded || advancedActive ? 'status.success.fg' : 'text.muted'
          }
          boxShadow="e1"
          flexShrink={0}
        >
          <LuSlidersHorizontal size={18} strokeWidth={2} />
        </IconButton>
      </HStack>
      {expanded ? (
        <Stack id={filtersId} gap={3}>
          <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
            <Box flex="1" minW={0}>
              <FormField label={t.filters.ownerLabel}>
                <Select value={ownerUserId} onChange={onOwner}>
                  <option value="">{t.filters.ownerAll}</option>
                  {owners.map((owner) => (
                    <option key={owner.ownerUserId} value={owner.ownerUserId}>
                      {owner.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </Box>
            <Box flex="1" minW={0}>
              <FormField label={t.filters.categoryLabel}>
                <Select value={category} onChange={onCategory}>
                  <option value="">{t.filters.categoryAll}</option>
                  {categories.map((item) => (
                    <option key={item.category} value={item.category}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </Box>
          </Stack>
          <Stack as="fieldset" gap={2} borderWidth={0} p={0} m={0}>
            <Text
              as="legend"
              fontSize="sm"
              fontWeight={600}
              color="text.default"
            >
              {t.filters.sectionLabel}
            </Text>
            <HStack gap={2} flexWrap="wrap">
              {sections.map((section) => {
                const selected = hubSection === section.value
                return (
                  <Button
                    key={section.value || 'all'}
                    type="button"
                    size="sm"
                    minH="44px"
                    cursor="pointer"
                    variant={selected ? 'primary' : 'secondary'}
                    aria-pressed={selected}
                    data-section={section.value}
                    onClick={onSection}
                  >
                    {section.label}
                  </Button>
                )
              })}
            </HStack>
          </Stack>
          {active ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              alignSelf="flex-start"
              minH="44px"
              cursor="pointer"
              onClick={onClear}
            >
              {t.filters.clear}
            </Button>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  )
}

export function MyTasksFilterEmpty({ onClear }: { onClear: () => void }) {
  const t = useI11n(bag)
  return (
    <Stack gap={3} maxW="36rem" py={4}>
      <Heading as="h2" size="md" color="text.default">
        {t.filters.noMatchTitle}
      </Heading>
      <Text fontSize="sm" color="text.muted" lineHeight="1.5">
        {t.filters.noMatchDescription}
      </Text>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        alignSelf="flex-start"
        minH="44px"
        cursor="pointer"
        onClick={onClear}
      >
        {t.filters.clear}
      </Button>
    </Stack>
  )
}

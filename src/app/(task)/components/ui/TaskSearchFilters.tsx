'use client'

import { HStack, Stack, chakra } from '@chakra-ui/react'
import {
  Button,
  FormErrorText,
  FormField,
  FormRow,
  FormStack,
  Input,
} from '@ui'
import { useId, useState } from 'react'
import { LuChevronDown, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { browseDatePresetRange } from '../../helpers/taskBrowseHelpers'
import bag from '../i11n.json'

type Panel = 'date' | 'budget'

/** A filter chip: green with its value and a clear button once set. Shared with My Tasks. */
export function FilterChip({
  label,
  activeLabel,
  expanded,
  panelId,
  onToggle,
  onClear,
  clearLabel,
}: {
  label: string
  /** The chosen value; the chip turns active when set. */
  activeLabel?: string
  expanded: boolean
  panelId: string
  onToggle: () => void
  onClear: () => void
  clearLabel: string
}) {
  const active = Boolean(activeLabel)
  const chipColors = active
    ? {
        bg: 'action.primary',
        color: 'text.onGreen',
        _hover: { bg: 'action.primaryHover', color: 'text.onGreen' },
      }
    : {
        bg: 'bg.surface',
        color: 'text.default',
        borderWidth: '1px',
        borderColor: 'border.strong',
        _hover: { bg: 'bg.subtle' },
      }
  return (
    <HStack gap={0}>
      <Button
        type="button"
        size="xs"
        variant="ghost"
        h={8}
        px={3}
        borderRadius="full"
        borderRightRadius={active ? 0 : 'full'}
        fontSize="xs"
        fontWeight={500}
        boxShadow="none"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        {...chipColors}
      >
        {activeLabel ?? label}
        <LuChevronDown size={12} strokeWidth={2.5} aria-hidden />
      </Button>
      {active ? (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          h={8}
          minW={0}
          pl={1.5}
          pr={2.5}
          borderLeftRadius={0}
          borderRightRadius="full"
          boxShadow="none"
          aria-label={clearLabel}
          onClick={onClear}
          {...chipColors}
        >
          <LuX size={12} strokeWidth={2.5} aria-hidden />
        </Button>
      ) : null}
    </HStack>
  )
}

/** One choice in a filter chip's panel. Shared with My Tasks. */
export function OptionButton({
  pressed,
  onPress,
  children,
}: {
  pressed: boolean
  onPress: () => void
  children: string
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? 'primary' : 'secondary'}
      aria-pressed={pressed}
      onClick={onPress}
    >
      {children}
    </Button>
  )
}

/**
 * Date and Budget chips (FE-201). Each opens a small panel below; changes
 * apply in place to both the list and the map pins.
 */
export function TaskSearchFilters() {
  const t = useI11n(bag)
  const {
    dateFilter,
    setDateFilter,
    budgetMinInput,
    budgetMaxInput,
    setBudgetMinInput,
    setBudgetMaxInput,
    budgetRangeInvalid,
    activeFilterTags,
    removeBrowseFilterTag,
    clearAllBrowseFilters,
  } = useTaskBrowseData()
  const [open, setOpen] = useState<Panel | null>(null)
  const [picking, setPicking] = useState(dateFilter?.preset === 'custom')
  const baseId = useId()
  const dateTag = activeFilterTags.find((tag) => tag.kind === 'date')
  const budgetTag = activeFilterTags.find((tag) => tag.kind === 'budget')
  const toggle = (panel: Panel) => setOpen(open === panel ? null : panel)

  const setCustomDate = (from: string, to: string) =>
    setDateFilter(from || to ? { preset: 'custom', from, to } : null)

  return (
    <Stack gap={2} pointerEvents="auto">
      <HStack gap={2} flexWrap="wrap">
        <FilterChip
          label={t.dateChip}
          activeLabel={dateTag?.label}
          expanded={open === 'date'}
          panelId={`${baseId}-date`}
          onToggle={() => toggle('date')}
          onClear={() => {
            setPicking(false)
            if (dateTag) removeBrowseFilterTag(dateTag)
          }}
          clearLabel={formatMessage(t.removeFilter, { label: t.dateChip })}
        />
        <FilterChip
          label={t.budgetChip}
          activeLabel={budgetTag?.label}
          expanded={open === 'budget'}
          panelId={`${baseId}-budget`}
          onToggle={() => toggle('budget')}
          onClear={() => {
            if (budgetTag) removeBrowseFilterTag(budgetTag)
          }}
          clearLabel={formatMessage(t.removeFilter, { label: t.budgetChip })}
        />
        {activeFilterTags.length > 0 ? (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            h={8}
            px={2}
            borderRadius="full"
            fontSize="xs"
            fontWeight={500}
            color="text.muted"
            onClick={() => {
              setPicking(false)
              clearAllBrowseFilters()
            }}
          >
            {t.clearAll}
          </Button>
        ) : null}
      </HStack>

      {open === 'date' ? (
        <chakra.fieldset
          id={`${baseId}-date`}
          m={0}
          minW={0}
          aria-label={t.dateChip}
          p={3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.surface"
        >
          <FormStack>
            <HStack gap="form.alternativesGap" flexWrap="wrap">
              <OptionButton
                pressed={dateFilter?.preset === 'today'}
                onPress={() => {
                  setPicking(false)
                  setDateFilter(browseDatePresetRange('today'))
                }}
              >
                {t.filterToday}
              </OptionButton>
              <OptionButton
                pressed={dateFilter?.preset === 'week'}
                onPress={() => {
                  setPicking(false)
                  setDateFilter(browseDatePresetRange('week'))
                }}
              >
                {t.filterThisWeek}
              </OptionButton>
              <OptionButton
                pressed={picking || dateFilter?.preset === 'custom'}
                onPress={() => {
                  setPicking(true)
                  if (dateFilter && dateFilter.preset !== 'custom') {
                    setDateFilter(null)
                  }
                }}
              >
                {t.filterPickDates}
              </OptionButton>
            </HStack>
            {picking || dateFilter?.preset === 'custom' ? (
              <FormRow>
                <FormField label={t.dateFrom}>
                  <Input
                    type="date"
                    value={
                      dateFilter?.preset === 'custom' ? dateFilter.from : ''
                    }
                    max={
                      dateFilter?.preset === 'custom' && dateFilter.to
                        ? dateFilter.to
                        : undefined
                    }
                    onChange={(e) =>
                      setCustomDate(
                        e.target.value,
                        dateFilter?.preset === 'custom' ? dateFilter.to : '',
                      )
                    }
                  />
                </FormField>
                <FormField label={t.dateTo}>
                  <Input
                    type="date"
                    value={dateFilter?.preset === 'custom' ? dateFilter.to : ''}
                    min={
                      dateFilter?.preset === 'custom' && dateFilter.from
                        ? dateFilter.from
                        : undefined
                    }
                    onChange={(e) =>
                      setCustomDate(
                        dateFilter?.preset === 'custom' ? dateFilter.from : '',
                        e.target.value,
                      )
                    }
                  />
                </FormField>
              </FormRow>
            ) : null}
          </FormStack>
        </chakra.fieldset>
      ) : null}

      {open === 'budget' ? (
        <chakra.fieldset
          id={`${baseId}-budget`}
          m={0}
          minW={0}
          aria-label={t.budgetChip}
          p={3}
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border.default"
          bg="bg.surface"
        >
          <Stack gap="form.controlToHelper">
            <FormRow>
              <FormField label={t.budgetMin}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={budgetMinInput}
                  onChange={(e) => setBudgetMinInput(e.target.value)}
                />
              </FormField>
              <FormField label={t.budgetMax}>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={budgetMaxInput}
                  onChange={(e) => setBudgetMaxInput(e.target.value)}
                />
              </FormField>
            </FormRow>
            {/* The pair's error: 4 under the row, the same line as a field's error. */}
            {budgetRangeInvalid ? (
              <FormErrorText>{t.budgetInvalid}</FormErrorText>
            ) : null}
          </Stack>
        </chakra.fieldset>
      ) : null}
    </Stack>
  )
}

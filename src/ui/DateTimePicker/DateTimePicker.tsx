'use client'

import { Box, Grid, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { useState } from 'react'
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu'

import { useLocale } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'

import {
  useFormControlMinH,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'
import { IconButton } from '../IconButton'
import { Modal } from '../Modal'
import {
  monthCells,
  parseTime,
  parseYmd,
  shiftMonth,
  toTime,
  toYmd,
} from './dateTime'
import bag from './i11n.json'

export type DateTimePickerProps = {
  /** `YYYY-MM-DD`. Empty until a day is chosen. */
  date: string
  onDateChange: (date: string) => void
  /** `HH:mm`. Shown, and edited, only when `withTime`. */
  time?: string
  onTimeChange?: (time: string) => void
  /** On a date and time: the modal also picks the time. */
  withTime?: boolean
  /** Earliest day, `YYYY-MM-DD`. Earlier days cannot be chosen. */
  min: string
  id?: string
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const intlLocale = (locale: string) => (locale === 'zh-hk' ? 'zh-HK' : 'en-GB')

function formatDate(date: string, locale: string): string {
  const parsed = parseYmd(date)
  if (!parsed) return ''
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(parsed.year, parsed.monthIndex, parsed.day)))
}

function formatMonth(year: number, monthIndex: number, locale: string): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, 1)))
}

/**
 * Date, and time when the task is on a date. The field opens a modal: a
 * month, then the hour and minute. Past days are not offered. Slashie tokens
 * only: the chosen day and time are the green fill.
 */
export function DateTimePicker({
  date,
  onDateChange,
  time = '',
  onTimeChange,
  withTime = false,
  min,
  id,
}: DateTimePickerProps) {
  const t = useI11n(bag)
  const locale = useLocale()
  const minH = useFormControlMinH()
  const field = useFormFieldControlProps({ id })
  const [open, setOpen] = useState(false)
  const initial = parseYmd(date) ??
    parseYmd(min) ?? { year: 2026, monthIndex: 0, day: 1 }
  const [cursor, setCursor] = useState({
    year: initial.year,
    monthIndex: initial.monthIndex,
  })
  const [draftDate, setDraftDate] = useState(date)
  const [draftTime, setDraftTime] = useState(parseTime(time) ? time : '09:00')

  const openModal = () => {
    const parsed = parseYmd(date) ?? parseYmd(min)
    if (parsed) setCursor({ year: parsed.year, monthIndex: parsed.monthIndex })
    setDraftDate(date)
    setDraftTime(parseTime(time) ? time : '09:00')
    setOpen(true)
  }

  const shown = formatDate(date, locale)
  const label = withTime
    ? [shown, parseTime(time) ? time : ''].filter(Boolean).join(', ')
    : shown

  const cells = monthCells(cursor.year, cursor.monthIndex)
  const draftClock = parseTime(draftTime) ?? { hour: 9, minute: 0 }
  const minutes = MINUTES.includes(draftClock.minute)
    ? MINUTES
    : [...MINUTES, draftClock.minute].sort((a, b) => a - b)

  return (
    <>
      <chakra.button
        type="button"
        id={field.id}
        aria-invalid={field['aria-invalid']}
        aria-describedby={field['aria-describedby']}
        aria-required={field.required || undefined}
        onClick={openModal}
        display="flex"
        alignItems="center"
        gap={2}
        w="full"
        maxW={{ md: '360px' }}
        minH={minH}
        px={3}
        borderRadius="md"
        borderWidth="1px"
        borderColor={
          field['aria-invalid'] ? 'status.danger.fg' : 'border.strong'
        }
        bg="bg.surface"
        color={label ? 'text.default' : 'text.subtle'}
        fontSize="md"
        textAlign="left"
        cursor="pointer"
        _focusVisible={sdlFocusRing}
      >
        <LuCalendar size={16} aria-hidden />
        {label || (withTime ? t.chooseDateTime : t.chooseDate)}
      </chakra.button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={withTime ? t.chooseDateTime : t.chooseDate}
        size="sm"
        submitLabel={t.done}
        submitDisabled={!draftDate}
        onSubmit={() => {
          if (!draftDate) return
          onDateChange(draftDate)
          if (withTime) onTimeChange?.(draftTime)
          setOpen(false)
        }}
      >
        <Stack gap={4}>
          <HStack justify="space-between">
            <IconButton
              aria-label={t.previousMonth}
              variant="ghost"
              onClick={() =>
                setCursor((current) =>
                  shiftMonth(current.year, current.monthIndex, -1),
                )
              }
            >
              <LuChevronLeft aria-hidden />
            </IconButton>
            <Text fontWeight={500}>
              {formatMonth(cursor.year, cursor.monthIndex, locale)}
            </Text>
            <IconButton
              aria-label={t.nextMonth}
              variant="ghost"
              onClick={() =>
                setCursor((current) =>
                  shiftMonth(current.year, current.monthIndex, 1),
                )
              }
            >
              <LuChevronRight aria-hidden />
            </IconButton>
          </HStack>
          <Grid templateColumns="repeat(7, 1fr)" gap={1}>
            {t.weekdays.map((day) => (
              <Text
                key={day}
                fontSize="xs"
                color="text.subtle"
                textAlign="center"
                fontWeight={500}
              >
                {day}
              </Text>
            ))}
            {cells.map((cell) => {
              if (cell.day == null) return <Box key={cell.key} />
              const value = toYmd(cursor.year, cursor.monthIndex, cell.day)
              const disabled = value < min
              const selected = value === draftDate
              return (
                <chakra.button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  aria-label={formatDate(value, locale)}
                  disabled={disabled}
                  onClick={() => setDraftDate(value)}
                  h="36px"
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight={selected ? 600 : 500}
                  bg={selected ? 'action.primary' : 'transparent'}
                  color={
                    selected
                      ? 'text.onGreen'
                      : disabled
                        ? 'text.subtle'
                        : 'text.default'
                  }
                  cursor={disabled ? 'not-allowed' : 'pointer'}
                  _hover={
                    disabled || selected ? undefined : { bg: 'bg.subtle' }
                  }
                  _focusVisible={sdlFocusRing}
                >
                  {cell.day}
                </chakra.button>
              )
            })}
          </Grid>
          {withTime ? (
            <Stack gap={3}>
              <TimeRow
                label={t.hour}
                values={HOURS}
                selected={draftClock.hour}
                onSelect={(hour) =>
                  setDraftTime(toTime(hour, draftClock.minute))
                }
              />
              <TimeRow
                label={t.minute}
                values={minutes}
                selected={draftClock.minute}
                onSelect={(minute) =>
                  setDraftTime(toTime(draftClock.hour, minute))
                }
              />
            </Stack>
          ) : null}
        </Stack>
      </Modal>
    </>
  )
}

function TimeRow({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string
  values: number[]
  selected: number
  onSelect: (value: number) => void
}) {
  return (
    <Stack gap={1.5}>
      <Text fontSize="xs" fontWeight={500} color="text.muted">
        {label}
      </Text>
      <Box maxH="120px" overflowY="auto">
        <Grid templateColumns="repeat(6, 1fr)" gap={1}>
          {values.map((value) => {
            const on = value === selected
            return (
              <chakra.button
                key={value}
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(value)}
                h="32px"
                borderRadius="md"
                borderWidth="1px"
                borderColor={on ? 'transparent' : 'border.default'}
                bg={on ? 'action.primary' : 'bg.surface'}
                color={on ? 'text.onGreen' : 'text.default'}
                fontSize="sm"
                fontWeight={500}
                cursor="pointer"
                _hover={on ? undefined : { bg: 'bg.subtle' }}
                _focusVisible={sdlFocusRing}
              >
                {String(value).padStart(2, '0')}
              </chakra.button>
            )
          })}
        </Grid>
      </Box>
    </Stack>
  )
}

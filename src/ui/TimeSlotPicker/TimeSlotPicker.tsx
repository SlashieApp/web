'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { type ChangeEvent, useCallback } from 'react'
import { LuPlus, LuX } from 'react-icons/lu'

import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure } from '@/theme/styles'
import {
  TIME_SLOT_DURATION_PRESETS,
  TIME_SLOT_MAX,
  type TimeSlotDraft,
  validateTimeSlotDrafts,
} from '@/utils/timeSlots'

import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Input } from '../Input/Input'
import { Select } from '../Select'

import bag from './i11n.json'

/** Days shown from today; extends to reach an already-chosen later date. */
const STRIP_DAYS = 56
const STRIP_MAX_DAYS = 366

const pad2 = (n: number) => String(n).padStart(2, '0')

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export type TimeSlotPickerProps = {
  value: TimeSlotDraft[]
  onChange: (next: TimeSlotDraft[]) => void
  /** Show per-slot errors (after a submit attempt). */
  showErrors?: boolean
  max?: number
  now?: Date
}

export function emptyTimeSlotDraft(): TimeSlotDraft {
  return { date: '', time: '', durationMinutes: null }
}

function DayStrip({
  value,
  onChange,
  locale,
  now,
}: {
  value: string
  onChange: (ymd: string) => void
  locale: string
  now: Date
}) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const chosen = value ? new Date(`${value}T12:00:00`) : null
  const daysToChosen =
    chosen && !Number.isNaN(chosen.getTime())
      ? Math.ceil((chosen.getTime() - start.getTime()) / 86_400_000) + 1
      : 0
  const length = Math.min(STRIP_MAX_DAYS, Math.max(STRIP_DAYS, daysToChosen))

  // Once per mount: bring an already-chosen day into view. Horizontal only,
  // so the page never jumps.
  const centreSelectedDay = useCallback((node: HTMLDivElement | null) => {
    const day = node?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (!node || !day) return
    node.scrollLeft =
      day.offsetLeft - node.clientWidth / 2 + day.clientWidth / 2
  }, [])
  const days = Array.from({ length }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  return (
    // Each day button carries its full date as its name; the slot heading
    // above names the group.
    <HStack
      ref={centreSelectedDay}
      gap={2}
      overflowX="auto"
      pb={1}
      css={{ scrollbarWidth: 'thin' }}
    >
      {days.map((d, i) => {
        const ymd = toYmd(d)
        const selected = value === ymd
        const showMonth = selected || i === 0 || d.getDate() === 1
        return (
          <Button
            key={ymd}
            type="button"
            aria-pressed={selected}
            aria-label={d.toLocaleDateString(locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
            size="sm"
            variant="ghost"
            flexShrink={0}
            minW="56px"
            h="auto"
            py={2}
            bg={selected ? 'action.primary' : 'bg.surface'}
            color={selected ? 'text.onGreen' : 'text.default'}
            borderWidth="1px"
            borderColor={selected ? 'action.primary' : 'border.default'}
            boxShadow="none"
            onClick={() => onChange(ymd)}
          >
            <Stack gap={0} align="center">
              <Text fontSize="xs" fontWeight={500}>
                {d.toLocaleDateString(locale, { weekday: 'short' })}
              </Text>
              <Text fontSize="sm" {...sdlFigure}>
                {d.getDate()}
              </Text>
              <Text fontSize="2xs" fontWeight={500} minH="1em">
                {showMonth
                  ? d.toLocaleDateString(locale, { month: 'short' })
                  : ''}
              </Text>
            </Stack>
          </Button>
        )
      })}
    </HStack>
  )
}

/**
 * One or two exact time slots: a day, a start time, and an optional length.
 * Used for quote times and reschedule proposals. Values are local wall time;
 * convert with `timeSlotInputsFromDrafts` before sending.
 */
export function TimeSlotPicker({
  value,
  onChange,
  showErrors = false,
  max = TIME_SLOT_MAX,
  now = new Date(),
}: TimeSlotPickerProps) {
  const copy = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const formatDuration = (minutes: number) =>
    minutes < 60
      ? formatMessage(copy.durationMinutes, { count: minutes })
      : minutes === 60
        ? copy.durationHour
        : formatMessage(copy.durationHours, { count: minutes / 60 })
  const slots = value.length > 0 ? value : [emptyTimeSlotDraft()]
  const errors = validateTimeSlotDrafts(slots, now)

  const update = (index: number, patch: Partial<TimeSlotDraft>) => {
    onChange(
      slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)),
    )
  }

  return (
    <Stack gap={4}>
      {slots.map((slot, index) => {
        const error = showErrors ? errors[index] : null
        const heading = copy.slotHeading.replace('{n}', String(index + 1))
        return (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: slots have no id until saved
            key={index}
            borderWidth="1px"
            borderColor={error ? 'status.danger.fg' : 'border.default'}
            borderRadius="lg"
            p={4}
          >
            <Stack gap={3}>
              <HStack justify="space-between">
                <Text fontWeight={500}>{heading}</Text>
                {slots.length > 1 ? (
                  <IconButton
                    type="button"
                    aria-label={`${copy.removeSlot}: ${heading}`}
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onChange(slots.filter((_, i) => i !== index))
                    }
                  >
                    <LuX />
                  </IconButton>
                ) : null}
              </HStack>
              <DayStrip
                value={slot.date}
                onChange={(date) => update(index, { date })}
                locale={locale}
                now={now}
              />
              <HStack gap={3} align="flex-end" flexWrap="wrap">
                <Box flex="1 1 140px">
                  <Text
                    as="label"
                    fontSize="sm"
                    fontWeight={500}
                    mb={1}
                    display="block"
                  >
                    {copy.startTime}
                    <Input
                      type="time"
                      mt={1}
                      value={slot.time}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        update(index, { time: e.target.value })
                      }
                    />
                  </Text>
                </Box>
                <Box flex="1 1 160px">
                  <Text
                    as="label"
                    fontSize="sm"
                    fontWeight={500}
                    mb={1}
                    display="block"
                  >
                    {copy.duration}
                    <Select
                      rootProps={{ mt: 1 }}
                      value={
                        slot.durationMinutes == null
                          ? ''
                          : String(slot.durationMinutes)
                      }
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        update(index, {
                          durationMinutes: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    >
                      {TIME_SLOT_DURATION_PRESETS.map((minutes) => (
                        <option key={minutes ?? 'none'} value={minutes ?? ''}>
                          {minutes == null
                            ? copy.noSetEnd
                            : formatDuration(minutes)}
                        </option>
                      ))}
                    </Select>
                  </Text>
                </Box>
              </HStack>
              {error ? (
                <Text fontSize="sm" color="status.danger.fg" role="alert">
                  {copy.errors[error]}
                </Text>
              ) : null}
            </Stack>
          </Box>
        )
      })}
      {slots.length < max ? (
        <Button
          type="button"
          variant="secondary"
          alignSelf="flex-start"
          onClick={() => onChange([...slots, emptyTimeSlotDraft()])}
        >
          <LuPlus aria-hidden />
          {copy.addSlot}
        </Button>
      ) : null}
    </Stack>
  )
}

'use client'

import { Box, HStack, Stack, Text, Wrap, WrapItem } from '@chakra-ui/react'
import { DayOfWeek } from '@codegen/schema'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { Heading, TextInput } from '@ui'
import type { TimeSlotTemplate } from '../createTaskFormSchema'

export type { TimeSlotTemplate } from '../createTaskFormSchema'

const WEEKDAY_FROM_JS: DayOfWeek[] = [
  DayOfWeek.Sun,
  DayOfWeek.Mon,
  DayOfWeek.Tue,
  DayOfWeek.Wed,
  DayOfWeek.Thu,
  DayOfWeek.Fri,
  DayOfWeek.Sat,
]

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.Mon,
  DayOfWeek.Tue,
  DayOfWeek.Wed,
  DayOfWeek.Thu,
  DayOfWeek.Fri,
  DayOfWeek.Sat,
  DayOfWeek.Sun,
]

const DAY_LABEL: Record<DayOfWeek, string> = {
  [DayOfWeek.Mon]: 'Mon',
  [DayOfWeek.Tue]: 'Tue',
  [DayOfWeek.Wed]: 'Wed',
  [DayOfWeek.Thu]: 'Thu',
  [DayOfWeek.Fri]: 'Fri',
  [DayOfWeek.Sat]: 'Sat',
  [DayOfWeek.Sun]: 'Sun',
}

function startOfWeekMonday(reference: Date): Date {
  const x = new Date(reference)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type CreateTaskScheduleSectionProps = {
  preferredDate: string
  preferredTime: string
  slotsByDay: Record<DayOfWeek, string[]>
  slotTemplates: readonly TimeSlotTemplate[]
  onPreferredDateChange: (value: string) => void
  onPreferredTimeChange: (value: string) => void
  onToggleSlot: (day: DayOfWeek, slotValue: string) => void
  fieldErrors?: {
    preferredDate?: string
    preferredTime?: string
    slotsByDay?: string
  }
}

export function CreateTaskScheduleSection({
  preferredDate,
  preferredTime,
  slotsByDay,
  slotTemplates,
  onPreferredDateChange,
  onPreferredTimeChange,
  onToggleSlot,
  fieldErrors,
}: CreateTaskScheduleSectionProps) {
  const weekAnchor = preferredDate
    ? new Date(`${preferredDate}T12:00:00`)
    : new Date()
  const monday = startOfWeekMonday(weekAnchor)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={5}>
        <Stack gap={1}>
          <Heading size="lg" color="primary.700">
            Timing & availability
          </Heading>
          <Text fontSize="sm" color="muted">
            Pick your preferred window and weekly slots. Professionals will try
            to accommodate your schedule when they quote.
          </Text>
        </Stack>

        <Stack gap={2}>
          <Text fontSize="sm" fontWeight={700}>
            Preferred date
          </Text>
          <HStack
            gap={2}
            overflowX="auto"
            pb={1}
            css={{ scrollbarWidth: 'thin' }}
          >
            {weekDays.map((d) => {
              const ymd = toYmd(d)
              const isSelected = preferredDate === ymd
              const dayNum = d.getDate()
              const dow =
                DAY_LABEL[WEEKDAY_FROM_JS[d.getDay()] ?? DayOfWeek.Mon] ?? ''
              return (
                <Button
                  key={ymd}
                  type="button"
                  size="sm"
                  variant="subtle"
                  flexShrink={0}
                  minW="56px"
                  bg={isSelected ? 'primary.600' : 'surfaceContainerLow'}
                  color={isSelected ? 'white' : 'fg'}
                  boxShadow="none"
                  onClick={() => onPreferredDateChange(ymd)}
                >
                  <Stack gap={0} align="center">
                    <Text fontSize="xs" fontWeight={700}>
                      {dow}
                    </Text>
                    <Text fontSize="sm" fontWeight={800}>
                      {dayNum}
                    </Text>
                  </Stack>
                </Button>
              )
            })}
          </HStack>
          {fieldErrors?.preferredDate ? (
            <Text fontSize="sm" color="red.500" mt={1}>
              {fieldErrors.preferredDate}
            </Text>
          ) : null}
        </Stack>

        <Box>
          <Text fontSize="sm" fontWeight={700} mb={2}>
            Preferred time
          </Text>
          <TextInput
            type="time"
            maxW={{ base: 'full', md: '240px' }}
            value={preferredTime}
            onChange={(e) => onPreferredTimeChange(e.target.value)}
          />
          {fieldErrors?.preferredTime ? (
            <Text fontSize="sm" color="red.500" mt={1}>
              {fieldErrors.preferredTime}
            </Text>
          ) : null}
        </Box>

        <Stack gap={3}>
          <Text fontSize="sm" fontWeight={700}>
            Weekly time windows
          </Text>
          <Text fontSize="sm" color="muted">
            Workers can align with these slots when they quote. Select at least
            one window on any day.
          </Text>
          {fieldErrors?.slotsByDay ? (
            <Text fontSize="sm" color="red.500">
              {fieldErrors.slotsByDay}
            </Text>
          ) : null}
          <Stack gap={4}>
            {DAY_ORDER.map((day) => {
              const selected = slotsByDay[day] ?? []
              return (
                <Box key={day}>
                  <Text fontSize="sm" fontWeight={700} color="fg" mb={2}>
                    {DAY_LABEL[day]}
                  </Text>
                  <Wrap gap={2}>
                    {slotTemplates.map((slot) => {
                      const isOn = selected.includes(slot.value)
                      return (
                        <WrapItem key={`${day}-${slot.value}`}>
                          <Button
                            type="button"
                            size="sm"
                            variant="subtle"
                            bg={isOn ? 'secondaryFixed' : 'surfaceContainerLow'}
                            color={isOn ? 'onSecondaryFixed' : 'fg'}
                            boxShadow="none"
                            onClick={() => onToggleSlot(day, slot.value)}
                          >
                            {slot.label}
                          </Button>
                        </WrapItem>
                      )
                    })}
                  </Wrap>
                </Box>
              )
            })}
          </Stack>
        </Stack>
      </Stack>
    </GlassCard>
  )
}

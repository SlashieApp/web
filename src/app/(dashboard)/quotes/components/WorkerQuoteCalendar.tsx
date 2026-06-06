'use client'

import { Box, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

import { Button, IconButton, SectionCard } from '@ui'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'
import {
  type WorkerQuoteCalendarMark,
  calendarMarksForMonth,
  formatCalendarDateKey,
  formatCalendarDateLabel,
} from '../helpers/workerQuoteSchedule'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function WorkerQuoteCalendar() {
  const {
    quoteRows,
    selectedCalendarDate,
    selectCalendarDate,
    clearSelectedCalendarDate,
  } = useWorkerQuotes()

  const [viewDate, setViewDate] = useState(() => {
    if (selectedCalendarDate) {
      const parsed = new Date(`${selectedCalendarDate}T12:00:00`)
      if (!Number.isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(viewDate)

  const marks = useMemo(
    () => calendarMarksForMonth(quoteRows, year, month),
    [quoteRows, year, month],
  )

  const cells = useMemo(() => buildMonthCells(year, month), [year, month])

  const goPrevMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    )
  }

  const goNextMonth = () => {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    )
  }

  const today = new Date()

  return (
    <SectionCard p={5}>
      <Stack gap={4}>
        <HStack justify="space-between" align="center">
          <Text fontWeight={700} fontSize="md" color="cardFg">
            Calendar
          </Text>
          <HStack gap={1}>
            <IconButton
              aria-label="Previous month"
              size="sm"
              variant="ghost"
              onClick={goPrevMonth}
            >
              <ChevronIcon direction="left" />
            </IconButton>
            <Text
              fontSize="sm"
              fontWeight={600}
              minW="120px"
              textAlign="center"
            >
              {monthLabel}
            </Text>
            <IconButton
              aria-label="Next month"
              size="sm"
              variant="ghost"
              onClick={goNextMonth}
            >
              <ChevronIcon direction="right" />
            </IconButton>
          </HStack>
        </HStack>

        {selectedCalendarDate ? (
          <HStack
            justify="space-between"
            align="center"
            gap={2}
            px={3}
            py={2}
            borderRadius="lg"
            bg="primary.100"
          >
            <Text fontSize="sm" color="primary.800" fontWeight={600}>
              {formatCalendarDateLabel(selectedCalendarDate)}
            </Text>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={clearSelectedCalendarDate}
            >
              Clear
            </Button>
          </HStack>
        ) : null}

        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {WEEKDAY_LABELS.map((label) => (
            <Text
              key={label}
              fontSize="xs"
              fontWeight={600}
              color="formLabelMuted"
              textAlign="center"
              py={1}
            >
              {label}
            </Text>
          ))}

          {cells.map((cell) => {
            if (cell.kind === 'pad') {
              return <Box key={cell.key} minH="36px" />
            }

            const dayMarks =
              marks.get(cell.day) ?? new Set<WorkerQuoteCalendarMark>()
            const dateKey = formatCalendarDateKey(year, month, cell.day)
            const isSelected = selectedCalendarDate === dateKey
            const isToday =
              cell.day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()
            const hasEvents = dayMarks.size > 0

            return (
              <Stack
                key={cell.key}
                gap={0.5}
                align="center"
                minH="36px"
                py={0.5}
              >
                <Button
                  variant="ghost"
                  size="xs"
                  w={7}
                  h={7}
                  minW={7}
                  p={0}
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight={isToday || isSelected ? 700 : 500}
                  bg={
                    isSelected
                      ? 'primary.600'
                      : isToday
                        ? 'primary.100'
                        : 'transparent'
                  }
                  color={
                    isSelected ? 'white' : isToday ? 'primary.800' : 'cardFg'
                  }
                  borderWidth={hasEvents && !isSelected ? '1px' : 0}
                  borderColor="primary.200"
                  transition="background 0.15s ease, color 0.15s ease"
                  _hover={{
                    bg: isSelected ? 'primary.700' : 'primary.100',
                  }}
                  aria-label={`Select ${dateKey}`}
                  aria-pressed={isSelected}
                  onClick={() => selectCalendarDate(dateKey)}
                >
                  {cell.day}
                </Button>
                <HStack gap={0.5} minH="6px" justify="center">
                  {dayMarks.has('booked') ? (
                    <CalendarDot tone="booked" />
                  ) : null}
                  {dayMarks.has('upcoming') ? (
                    <CalendarDot tone="upcoming" />
                  ) : null}
                </HStack>
              </Stack>
            )
          })}
        </Grid>

        <HStack gap={4} flexWrap="wrap" fontSize="xs" color="formLabelMuted">
          <HStack gap={1.5}>
            <CalendarDot tone="booked" />
            <Text>Booked jobs</Text>
          </HStack>
          <HStack gap={1.5}>
            <CalendarDot tone="upcoming" />
            <Text>Upcoming</Text>
          </HStack>
        </HStack>
      </Stack>
    </SectionCard>
  )
}

function CalendarDot({ tone }: { tone: WorkerQuoteCalendarMark }) {
  return (
    <Box
      w="6px"
      h="6px"
      borderRadius="full"
      bg={tone === 'booked' ? 'primary.500' : 'secondary.500'}
    />
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>{direction === 'left' ? 'Previous' : 'Next'}</title>
      <path
        d={direction === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type MonthCell =
  | { kind: 'pad'; key: string }
  | { kind: 'day'; key: string; day: number }

function buildMonthCells(year: number, month: number): MonthCell[] {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  const cells: MonthCell[] = []

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({ kind: 'pad', key: `pad-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ kind: 'day', key: `day-${day}`, day })
  }

  return cells
}

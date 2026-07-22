'use client'

import type { ChangeEvent } from 'react'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { TaskDateTimeType } from '@codegen/schema'
import { Button, FormField, Input, Select } from '@ui'
import { CreateTaskSection } from '../shared/CreateTaskSection'

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type CreateTaskScheduleSectionProps = {
  /** Bare mode for the stepped create flow (no Card/heading). */
  bare?: boolean
  /** Card header text (card mode only). */
  sectionHeading?: string
  datetimeType: TaskDateTimeType
  onDatetimeTypeChange: (value: TaskDateTimeType) => void
  preferredDate: string
  preferredTime: string
  onPreferredDateChange: (value: string) => void
  onPreferredTimeChange: (value: string) => void
  fieldErrors?: {
    preferredDate?: string
    preferredTime?: string
  }
}

export function CreateTaskScheduleSection({
  bare = false,
  sectionHeading = '3. Timing',
  datetimeType,
  onDatetimeTypeChange,
  preferredDate,
  preferredTime,
  onPreferredDateChange,
  onPreferredTimeChange,
  fieldErrors,
}: CreateTaskScheduleSectionProps) {
  const weekAnchor = preferredDate
    ? new Date(`${preferredDate}T12:00:00`)
    : new Date()
  const monday = (() => {
    const x = new Date(weekAnchor)
    const day = x.getDay()
    const diff = day === 0 ? -6 : 1 - day
    x.setDate(x.getDate() + diff)
    x.setHours(0, 0, 0, 0)
    return x
  })()
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })

  const showDatePicker =
    datetimeType === TaskDateTimeType.Before ||
    datetimeType === TaskDateTimeType.Exact
  const showTimePicker = datetimeType === TaskDateTimeType.Exact

  return (
    <CreateTaskSection
      bare={bare}
      heading={sectionHeading}
      bodyGap={5}
      headingSubtext={
        <Text fontSize="sm" color="text.muted">
          Tell workers when you need the work done. You can keep it flexible or
          pin an exact slot.
        </Text>
      }
    >
      <FormField label="When do you need this?">
        <Select
          rootProps={{ maxW: { base: 'full', md: '320px' } }}
          value={datetimeType}
          onChange={(e) =>
            onDatetimeTypeChange(e.target.value as TaskDateTimeType)
          }
        >
          <option value={TaskDateTimeType.Flexible}>Flexible</option>
          <option value={TaskDateTimeType.Before}>Before a date</option>
          <option value={TaskDateTimeType.Exact}>Exact date & time</option>
        </Select>
      </FormField>

      {showDatePicker ? (
        <Stack gap={2}>
          <Text fontSize="sm" fontWeight={700}>
            Pick a week, then a day
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
              const dow = d.toLocaleDateString('en-GB', { weekday: 'short' })
              return (
                <Button
                  key={ymd}
                  type="button"
                  size="sm"
                  variant="ghost"
                  flexShrink={0}
                  minW="56px"
                  bg={isSelected ? 'action.primary' : 'bg.surface'}
                  color={isSelected ? 'text.onGreen' : 'text.default'}
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
            <Text fontSize="sm" color="status.danger.fg" mt={1}>
              {fieldErrors.preferredDate}
            </Text>
          ) : null}
        </Stack>
      ) : null}

      {showTimePicker ? (
        <Box>
          <Text fontSize="sm" fontWeight={700} mb={2}>
            Preferred time
          </Text>
          <Input
            type="time"
            maxW={{ base: 'full', md: '240px' }}
            value={preferredTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onPreferredTimeChange(e.target.value)
            }
          />
          {fieldErrors?.preferredTime ? (
            <Text fontSize="sm" color="status.danger.fg" mt={1}>
              {fieldErrors.preferredTime}
            </Text>
          ) : null}
        </Box>
      ) : null}
    </CreateTaskSection>
  )
}

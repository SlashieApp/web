'use client'

import type { ReactNode } from 'react'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import {
  Box,
  HStack,
  Heading,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react'
import { TaskDateTimeType } from '@codegen/schema'
import type { CreateTaskFormValues } from '../createTaskFormSchema'

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export type CreateTaskScheduleSectionProps = {
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
    <GlassCard p={{ base: 5, md: 6 }} bg="neutral.100">
      <Stack gap={5}>
        <Stack gap={1}>
          <Heading size="lg" color="primary.700">
            Timing
          </Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Tell workers when you need the work done. You can keep it flexible
            or pin an exact slot.
          </Text>
        </Stack>

        <FormFieldRow label="When do you need this?">
          <NativeSelect.Root maxW={{ base: 'full', md: '320px' }}>
            <NativeSelect.Field
              bg="neutral.100"
              borderWidth="1px"
              borderColor="jobCardBorder"
              borderRadius="lg"
              value={datetimeType}
              onChange={(e) =>
                onDatetimeTypeChange(e.target.value as TaskDateTimeType)
              }
            >
              <option value={TaskDateTimeType.Flexible}>Flexible</option>
              <option value={TaskDateTimeType.Before}>Before a date</option>
              <option value={TaskDateTimeType.Exact}>Exact date & time</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormFieldRow>

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
                    variant="subtle"
                    flexShrink={0}
                    minW="56px"
                    bg={isSelected ? 'primary.600' : 'jobCardBg'}
                    color={isSelected ? 'white' : 'jobCardTitle'}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onPreferredTimeChange(e.target.value)
              }
              bg="neutral.100"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="formControlBorder"
              _focusVisible={{ borderColor: 'formControlFocusBorder' }}
            />
            {fieldErrors?.preferredTime ? (
              <Text fontSize="sm" color="red.500" mt={1}>
                {fieldErrors.preferredTime}
              </Text>
            ) : null}
          </Box>
        ) : null}
      </Stack>
    </GlassCard>
  )
}

function FormFieldRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Stack gap={2}>
      <Text fontSize="sm" fontWeight={700}>
        {label}
      </Text>
      {children}
    </Stack>
  )
}

'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { TaskDateTimeType } from '@codegen/schema'
import { LuLock } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import {
  Badge,
  DateTimePicker,
  FormCheckbox,
  FormField,
  RadioButtonGroup,
} from '@ui'

import { londonToday } from '../../../createTaskFormSchema'
import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'

export type CreateTaskScheduleSectionProps = {
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  datetimeType: TaskDateTimeType
  onDatetimeTypeChange: (value: TaskDateTimeType) => void
  preferredDate: string
  preferredTime: string
  onPreferredDateChange: (value: string) => void
  onPreferredTimeChange: (value: string) => void
  /** Copy keys from the form schema. */
  fieldErrors?: {
    preferredDate?: string
    preferredTime?: string
  }
  /**
   * "Mark as urgent" (FE-603). Always shown. `locked` is an account without
   * Slashie Pro: the box is disabled, with the Pro tag and a lock. A task
   * that is already urgent can still be unticked.
   */
  urgent?: {
    checked: boolean
    locked?: boolean
    onChange: (checked: boolean) => void
  }
}

/**
 * Flexible, before a date, or a date and time. The date (and the time, on a
 * date) opens in a modal. Past days are not offered. "Mark as urgent" always
 * follows. Without Slashie Pro it is locked.
 */
export function CreateTaskScheduleSection({
  bare = false,
  sectionHeading = '',
  datetimeType,
  onDatetimeTypeChange,
  preferredDate,
  preferredTime,
  onPreferredDateChange,
  onPreferredTimeChange,
  fieldErrors,
  urgent,
}: CreateTaskScheduleSectionProps) {
  const t = useI11n(bag)
  const f = t.fields
  const showDate =
    datetimeType === TaskDateTimeType.Before ||
    datetimeType === TaskDateTimeType.Exact
  const showTime = datetimeType === TaskDateTimeType.Exact

  return (
    <CreateTaskSection
      bare={bare}
      heading={sectionHeading}
      headingSubtext={
        <Text fontSize="sm" color="text.muted">
          {t.steps.timing.description}
        </Text>
      }
    >
      <RadioButtonGroup
        label={f.when}
        value={datetimeType}
        options={[
          { value: TaskDateTimeType.Flexible, label: f.flexible },
          { value: TaskDateTimeType.Before, label: f.before },
          { value: TaskDateTimeType.Exact, label: f.exact },
        ]}
        onChange={onDatetimeTypeChange}
      />

      {showDate ? (
        <FormField
          label={datetimeType === TaskDateTimeType.Before ? f.doneBy : f.date}
          required
          errorText={taskFieldError(
            t.errors,
            fieldErrors?.preferredDate ??
              (showTime ? fieldErrors?.preferredTime : undefined),
          )}
        >
          <DateTimePicker
            date={preferredDate}
            time={preferredTime}
            withTime={showTime}
            min={londonToday()}
            onDateChange={onPreferredDateChange}
            onTimeChange={onPreferredTimeChange}
          />
        </FormField>
      ) : null}

      {urgent ? (
        <Stack gap="form.controlToHelper" data-urgent-option="">
          <FormCheckbox
            checked={urgent.checked}
            disabled={Boolean(urgent.locked) && !urgent.checked}
            onCheckedChange={(checked) => {
              if (urgent.locked && checked) return
              urgent.onChange(checked)
            }}
            label={
              <HStack as="span" gap={1.5} display="inline-flex">
                {f.urgent}
                <Badge
                  variant="premium"
                  size="sm"
                  shape="pill"
                  aria-label={f.proBadgeLabel}
                  verticalAlign="middle"
                >
                  {f.proBadge}
                </Badge>
                {urgent.locked ? (
                  <LuLock
                    size={14}
                    aria-hidden
                    data-urgent-lock=""
                    style={{ verticalAlign: 'middle' }}
                  />
                ) : null}
              </HStack>
            }
          />
          <Text fontSize="xs" color="text.muted" lineHeight="short" ps={8}>
            {f.urgentHelper}
          </Text>
        </Stack>
      ) : null}
    </CreateTaskSection>
  )
}

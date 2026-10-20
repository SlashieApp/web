'use client'

import { Text } from '@chakra-ui/react'
import { TaskDateTimeType } from '@codegen/schema'

import { useI11n } from '@/i18n/useI11n'
import { FormField, Input, RadioButtonGroup } from '@ui'

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
}

/**
 * Flexible, before a date, or a date and time. The date is the device's own
 * picker from today on, so any week is reachable and past days aren't.
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
      bodyGap={5}
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
          errorText={taskFieldError(t.errors, fieldErrors?.preferredDate)}
        >
          <Input
            type="date"
            min={londonToday()}
            value={preferredDate}
            onChange={(e) => onPreferredDateChange(e.target.value)}
            rootProps={{ maxW: { base: 'full', md: '240px' } }}
          />
        </FormField>
      ) : null}

      {showTime ? (
        <FormField
          label={f.time}
          required
          errorText={taskFieldError(t.errors, fieldErrors?.preferredTime)}
        >
          <Input
            type="time"
            value={preferredTime}
            onChange={(e) => onPreferredTimeChange(e.target.value)}
            rootProps={{ maxW: { base: 'full', md: '240px' } }}
          />
        </FormField>
      ) : null}
    </CreateTaskSection>
  )
}

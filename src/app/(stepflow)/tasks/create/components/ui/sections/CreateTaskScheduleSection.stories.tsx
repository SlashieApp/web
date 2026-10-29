import { TaskDateTimeType } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect } from 'storybook/test'

import { storyDateInDays } from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  expectChoiceGroup,
  expectGaps,
  fieldByLabel,
  phone390,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import { expectField } from '@/ui/Modal/taskDialogSpacing.testing'
import { createTaskStoryErrors } from '../../createTaskStoryFixtures'
import {
  CreateTaskScheduleSection,
  type CreateTaskScheduleSectionProps,
} from './CreateTaskScheduleSection'

type DemoProps = Omit<
  CreateTaskScheduleSectionProps,
  'onDatetimeTypeChange' | 'onPreferredDateChange' | 'onPreferredTimeChange'
>

function CreateTaskScheduleSectionDemo({
  datetimeType,
  preferredDate,
  preferredTime,
  ...props
}: DemoProps) {
  const [type, setType] = useState(datetimeType)
  const [date, setDate] = useState(preferredDate)
  const [time, setTime] = useState(preferredTime)
  return (
    <CreateTaskScheduleSection
      {...props}
      datetimeType={type}
      onDatetimeTypeChange={setType}
      preferredDate={date}
      onPreferredDateChange={setDate}
      preferredTime={time}
      onPreferredTimeChange={setTime}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskScheduleSection',
  component: CreateTaskScheduleSectionDemo,
  parameters: { layout: 'padded' },
  args: {
    bare: true,
    datetimeType: TaskDateTimeType.Flexible,
    preferredDate: storyDateInDays(7),
    preferredTime: '09:00',
  },
} satisfies Meta<typeof CreateTaskScheduleSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Flexible: no date or time to choose. */
export const Flexible: Story = {}

/** Before a date: the week strip appears with the chosen day selected. */
export const BeforeDate: Story = {
  args: { datetimeType: TaskDateTimeType.Before },
}

/** Exact date and time: the week strip plus a time field. */
export const ExactDateAndTime: Story = {
  args: { datetimeType: TaskDateTimeType.Exact },
}

/** Before a date with no day picked: the real message shows under the strip. */
export const DateRequired: Story = {
  args: {
    datetimeType: TaskDateTimeType.Before,
    preferredDate: '',
    fieldErrors: createTaskStoryErrors({
      datetimeType: TaskDateTimeType.Before,
    }),
  },
}

/** Exact slot with the day picked but no time: the message shows under it. */
export const TimeRequired: Story = {
  args: {
    datetimeType: TaskDateTimeType.Exact,
    preferredTime: '',
    fieldErrors: createTaskStoryErrors({
      datetimeType: TaskDateTimeType.Exact,
      preferredDate: storyDateInDays(7),
    }),
  },
}

/** Card mode (edit page): the fields sit in a titled section card. */
export const CardMode: Story = {
  args: { bare: false, datetimeType: TaskDateTimeType.Exact },
}

/**
 * Form spacing (FE-481): the "When" group is a choice group (label 8, rows 8
 * apart), and it and the date and time fields are 20 apart and 48 tall.
 */
export const Spacing: Story = {
  ...phone390,
  args: { datetimeType: TaskDateTimeType.Exact },
  play: async ({ canvasElement }) => {
    const when = await expectChoiceGroup(canvasElement, 'When')
    const date = fieldByLabel(canvasElement, /^Date/)
    const time = fieldByLabel(canvasElement, /^Time/)
    await expectGaps([when.root, date, time], formSpace.fieldGap)
    await expectField(date)
    await expectField(time)
  },
}

import { TaskDateTimeType } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

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
  | 'onDatetimeTypeChange'
  | 'onPreferredDateChange'
  | 'onPreferredTimeChange'
  | 'urgent'
> & {
  /** With Slashie Pro: show "Mark as urgent", starting ticked or not. */
  urgentOption?: boolean
  startsUrgent?: boolean
}

function CreateTaskScheduleSectionDemo({
  datetimeType,
  preferredDate,
  preferredTime,
  urgentOption = false,
  startsUrgent = false,
  ...props
}: DemoProps) {
  const [isUrgent, setIsUrgent] = useState(startsUrgent)
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
      urgent={
        urgentOption ? { checked: isUrgent, onChange: setIsUrgent } : undefined
      }
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

/**
 * Flexible: no date or time to choose. Without Slashie Pro there is no
 * "Mark as urgent" either (FE-603): the option is not shown at all.
 */
export const Flexible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('checkbox')).toBeNull()
    await expect(canvas.queryByText(/urgent/i)).toBeNull()
    await expect(canvasElement.querySelector('[data-urgent-option]')).toBeNull()
  },
}

/**
 * With Slashie Pro (FE-603, Ryan 22 Nov): "Mark as urgent" follows the timing
 * choice, with a Pro badge and what it does. It starts off and a tap ticks it.
 */
export const UrgentWithPro: Story = {
  args: { urgentOption: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const option = canvas.getByRole('checkbox', { name: /Mark as urgent/ })
    await expect(option).not.toBeChecked()
    await expect(canvas.getByLabelText('Slashie Pro')).toHaveTextContent('Pro')
    await expect(
      canvas.getByText('Workers see an Urgent tag on your task.'),
    ).toBeVisible()
    // After the timing choice, never before it.
    const group = canvas.getByRole('radiogroup')
    await expect(
      group.compareDocumentPosition(option) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    await userEvent.click(option)
    await expect(option).toBeChecked()
    await userEvent.click(option)
    await expect(option).not.toBeChecked()
  },
}

/** A task already marked urgent (Edit task): ticked, and it can come off. */
export const UrgentTicked: Story = {
  args: {
    urgentOption: true,
    startsUrgent: true,
    datetimeType: TaskDateTimeType.Exact,
  },
  play: async ({ canvasElement }) => {
    const option = within(canvasElement).getByRole('checkbox', {
      name: /Mark as urgent/,
    })
    await expect(option).toBeChecked()
    await userEvent.click(option)
    await expect(option).not.toBeChecked()
  },
}

/** A phone: the label, its badge and the helper stay inside the column. */
export const UrgentPhone: Story = {
  ...phone390,
  args: { urgentOption: true },
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument.documentElement
    await expect(doc.scrollWidth).toBeLessThanOrEqual(doc.clientWidth)
    const option = canvasElement.querySelector(
      '[data-urgent-option]',
    ) as HTMLElement
    await expect(option.getBoundingClientRect().right).toBeLessThanOrEqual(
      doc.clientWidth,
    )
  },
}

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

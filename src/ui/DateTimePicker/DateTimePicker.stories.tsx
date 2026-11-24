import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { FormField } from '../FormField'
import { DateTimePicker } from './DateTimePicker'

function Demo({
  withTime = false,
  initialDate = '',
  initialTime = '09:00',
}: {
  withTime?: boolean
  initialDate?: string
  initialTime?: string
}) {
  const [date, setDate] = useState(initialDate)
  const [time, setTime] = useState(initialTime)
  return (
    <FormField label={withTime ? 'Date' : 'Done by'} required>
      <DateTimePicker
        date={date}
        time={time}
        withTime={withTime}
        min="2026-06-01"
        onDateChange={setDate}
        onTimeChange={setTime}
      />
    </FormField>
  )
}

const meta = {
  title: 'UI/DateTimePicker',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** Closed: a field that opens the calendar. */
export const DateOnly: Story = {}

/** On a date and time: the modal also offers hour and minute. */
export const WithTime: Story = {
  args: { withTime: true, initialDate: '2026-06-14', initialTime: '09:00' },
}

/** Choosing a day writes it back to the field. */
export const PicksADay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Choose a date/ }))
    const dialog = within(canvasElement.ownerDocument.body)
    await userEvent.click(await dialog.findByRole('button', { name: /14/ }))
    await userEvent.click(dialog.getByRole('button', { name: 'Done' }))
    await expect(canvas.getByRole('button', { name: /14/ })).toBeVisible()
  },
}

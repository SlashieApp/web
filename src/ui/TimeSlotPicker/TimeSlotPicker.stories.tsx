import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import type { TimeSlotDraft } from '@/utils/timeSlots'

import { TimeSlotPicker } from './TimeSlotPicker'

/** `YYYY-MM-DD`, `days` from today (stories stay valid as time passes). */
function inDays(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Demo({
  initial,
  showErrors,
}: {
  initial: TimeSlotDraft[]
  showErrors?: boolean
}) {
  const [value, setValue] = useState(initial)
  return (
    <Box maxW="560px">
      <TimeSlotPicker
        value={value}
        onChange={setValue}
        showErrors={showErrors}
      />
    </Box>
  )
}

const meta = {
  title: 'UI/TimeSlotPicker',
  component: Demo,
  parameters: { layout: 'padded' },
  args: { initial: [] },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** One empty slot; "Add another time" allows a second. */
export const Default: Story = {}

/** Two slots: the maximum, so Add is gone and each slot can be removed. */
export const TwoSlots: Story = {
  args: {
    initial: [
      { date: inDays(3), time: '09:00', durationMinutes: 120 },
      { date: inDays(30), time: '14:00', durationMinutes: null },
    ],
  },
}

/** After a submit attempt with a missing start time. */
export const WithErrors: Story = {
  args: {
    initial: [{ date: inDays(3), time: '', durationMinutes: null }],
    showErrors: true,
  },
}

/** One slot filled: day, start time and length chosen, Add still shown. */
export const OneSlotFilled: Story = {
  args: {
    initial: [{ date: inDays(5), time: '10:30', durationMinutes: 60 }],
  },
}

/** Far date: a day past eight weeks extends the day strip and scrolls to it. */
export const FarDateSelected: Story = {
  args: {
    initial: [{ date: inDays(120), time: '09:00', durationMinutes: 120 }],
  },
}

/** Error, past: a start that has already gone asks for a time in the future. */
export const ErrorPast: Story = {
  args: {
    initial: [{ date: inDays(-1), time: '09:00', durationMinutes: null }],
    showErrors: true,
  },
}

/** Error, too far: a start more than a year away asks for a closer time. */
export const ErrorTooFar: Story = {
  args: {
    initial: [{ date: inDays(400), time: '09:00', durationMinutes: null }],
    showErrors: true,
  },
}

/** Error, duplicate: the second slot repeats the first start time. */
export const ErrorDuplicate: Story = {
  args: {
    initial: [
      { date: inDays(3), time: '09:00', durationMinutes: 60 },
      { date: inDays(3), time: '09:00', durationMinutes: 60 },
    ],
    showErrors: true,
  },
}

/** Phone width: the day strip scrolls sideways and the fields wrap. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    initial: [{ date: inDays(5), time: '10:30', durationMinutes: 60 }],
  },
}

/** Traditional Chinese copy and day names from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  args: {
    initial: [{ date: inDays(5), time: '10:30', durationMinutes: 60 }],
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('開始時間', undefined, {
        timeout: 3000,
      }),
    ).toBeVisible()
  },
}

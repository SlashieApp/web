import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formSpace } from '@/theme/styles'
import type { TimeSlotDraft } from '@/utils/timeSlots'

import { gapBelow, gapBeside } from '../FormField/formGap.testing'
import { expectField } from '../Modal/taskDialogSpacing.testing'
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

/** The card of slot `n`, found by its heading: a box with the heading row, then the fields. */
const cardOf = (canvas: ReturnType<typeof within>, n: number) =>
  canvas.getByText(`Time ${n}`).parentElement?.parentElement as HTMLElement

/** The parts of one card: heading row, day strip, the pair of fields, and the slot's error (if any). */
function partsOf(card: HTMLElement) {
  const [heading, fields] = [...card.children] as HTMLElement[]
  const [strip, pairBlock] = [...fields.children] as HTMLElement[]
  const [pair, error] = [...pairBlock.children] as HTMLElement[]
  const [startBox, durationBox] = [...pair.children] as HTMLElement[]
  return {
    heading,
    strip,
    pair,
    error: error ?? null,
    start: startBox.firstElementChild as HTMLElement,
    duration: durationBox.firstElementChild as HTMLElement,
  }
}

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges. A slot card is a small section: its heading is 12 above the day strip
 * (section title to first field), the strip 20 above the fields, and Start time
 * and How long are FormFields (label 8 above, 48 tall) side by side 12 apart.
 * A slot's error sits 4 under them.
 */
export const Spacing: Story = {
  args: {
    initial: [{ date: inDays(3), time: '', durationMinutes: null }],
    showErrors: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { heading, strip, pair, error, start, duration } = partsOf(
      cardOf(canvas, 1),
    )

    await expect(gapBelow(heading, strip)).toBe(formSpace.sectionTitleToField)
    await expect(gapBelow(strip, pair)).toBe(formSpace.fieldGap)
    await expectField(start)
    await expectField(duration)
    // Side by side: 12 apart, level (labels on one line).
    await expect(gapBeside(start, duration)).toBe(formSpace.inlineGap)
    await expect(
      Math.abs(
        start.getBoundingClientRect().top -
          duration.getBoundingClientRect().top,
      ),
    ).toBeLessThan(0.5)
    await expect(error).toHaveTextContent('Pick a day and a start time.')
    await expect(gapBelow(pair, error as HTMLElement)).toBe(
      formSpace.controlToHelper,
    )
    // The shared error line under a control: 12 on a 16 line, medium, with a
    // dot, announced as it appears.
    const line = error as HTMLElement
    const style = getComputedStyle(line)
    await expect(style.fontSize).toBe('12px')
    await expect(style.lineHeight).toBe('16px')
    await expect(style.fontWeight).toBe('500')
    await expect(line.getBoundingClientRect().height).toBe(16)
    await expect(line).toHaveAttribute('role', 'alert')
    await expect(line.querySelector('[aria-hidden="true"]')).not.toBeNull()
  },
}

/** In a card too narrow for both, the fields stack and sit 20 apart, like any two fields. */
export const SpacingNarrow: Story = {
  args: { initial: [{ date: inDays(3), time: '10:30', durationMinutes: 60 }] },
  decorators: [
    (Story) => (
      <Box maxW="300px">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    const { start, duration, error } = partsOf(cardOf(within(canvasElement), 1))

    await expect(gapBelow(start, duration)).toBe(formSpace.fieldGap)
    await expectField(start)
    await expectField(duration)
    await expect(error).toBeNull()
  },
}

/** Two slots: the cards sit 20 apart (the Add button is gone at the maximum). */
export const SpacingTwoSlots: Story = {
  args: {
    initial: [
      { date: inDays(3), time: '09:00', durationMinutes: 120 },
      { date: inDays(30), time: '14:00', durationMinutes: null },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(gapBelow(cardOf(canvas, 1), cardOf(canvas, 2))).toBe(
      formSpace.fieldGap,
    )
    await expect(
      canvas.queryByRole('button', { name: 'Add another time' }),
    ).toBeNull()
  },
}

/** One slot: the Add button sits 20 under the card. */
export const SpacingAddButton: Story = {
  args: { initial: [{ date: inDays(5), time: '10:30', durationMinutes: 60 }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      gapBelow(
        cardOf(canvas, 1),
        canvas.getByRole('button', { name: 'Add another time' }),
      ),
    ).toBe(formSpace.fieldGap)
  },
}

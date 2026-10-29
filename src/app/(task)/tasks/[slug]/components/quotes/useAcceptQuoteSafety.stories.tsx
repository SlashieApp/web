import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect, useMemo, useRef } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  barButton,
  bodyColumn,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  gapsBetweenChildren,
  openDialog,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'
import { scrollToEnd } from '@/ui/Modal/taskDialogSpacing.testing'

import { useAcceptQuoteDialog } from './useAcceptQuoteSafety'

type Slot = { id: string; start: string; end?: string }

/** An ISO start `days` from now at 09:00 (negative: already passed). */
function startIn(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

/** Opens the owner's accept confirm for one quote, as the Accept button does. */
function Harness({
  slots,
  onAccept,
}: {
  slots: readonly Slot[]
  onAccept: (quoteId: string, slotId: string) => unknown
}) {
  const quotes = useMemo(
    () => [{ id: 'quote-1', proposedSlots: slots }],
    [slots],
  )
  const { requestAccept, dialog } = useAcceptQuoteDialog({
    quotes,
    onAccept,
    acceptingQuoteId: null,
  })
  const opened = useRef(false)
  useEffect(() => {
    if (opened.current) return
    opened.current = true
    requestAccept('quote-1')
  }, [requestAccept])
  return dialog
}

/**
 * The accept-quote confirm: the owner picks one of the quote's proposed times
 * (it becomes the booking), then reads the safety line and the booking hint.
 * Task detail and Messages open it through `useAcceptQuoteDialog`.
 */
const meta = {
  title: 'Task detail/Quotes/AcceptQuoteDialog',
  component: Harness,
  parameters: { layout: 'padded' },
  args: {
    onAccept: fn(),
    slots: [
      { id: 'slot-1', start: startIn(3) },
      { id: 'slot-2', start: startIn(5) },
      { id: 'slot-past', start: startIn(-1) },
    ],
  },
} satisfies Meta<typeof Harness>

export default meta
type Story = StoryObj<typeof meta>

/** Two times to pick from and one that has passed (shown, disabled). */
export const PickATime: Story = {
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Accept this quote?')
    const accept = barButton(dialog, 'Accept quote')

    await expect(accept).toBeDisabled()
    const group = within(dialog).getByRole('radiogroup', {
      name: 'Pick a time',
    })
    await userEvent.click(within(group).getAllByRole('button')[0])
    await expect(accept).toBeEnabled()
  },
}

/** The only time has passed: the dialog says so and there is nothing to pick. */
export const NoFutureTimes: Story = {
  args: { slots: [{ id: 'slot-past', start: startIn(-2) }] },
  play: async ({ canvasElement }) => {
    const { dialog } = await openDialog(canvasElement, 'Accept this quote?')

    await expect(
      within(dialog).getByText(/All of this worker's times have passed/),
    ).toBeInTheDocument()
    await expect(barButton(dialog, 'Accept quote')).toBeDisabled()
  },
}

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges. The time is one choice group laid out like a field: its label 8 above
 * the rows, the rows 8 apart, the hint 4 under them. The group, the safety line
 * and the booking hint sit 20 apart, the group 24 under the title, and the body
 * ends 20 above the buttons.
 */
async function expectAcceptSpacing(canvasElement: HTMLElement) {
  const { dialog, title, body } = await openDialog(
    canvasElement,
    'Accept this quote?',
  )
  const column = bodyColumn(body)
  const [group, safety, booking] = [...column.children] as HTMLElement[]
  const [label, rows, hint] = [...group.children] as HTMLElement[]
  const radios = [...rows.children] as HTMLElement[]

  await expect(label).toHaveTextContent('Pick a time')
  await expect(rows).toHaveAccessibleName('Pick a time')
  await expect(rows).toHaveAccessibleDescription(
    'The time you pick becomes the booking.',
  )
  await expect(radios).toHaveLength(3)
  await expect(gapBelow(title, group)).toBe(formSpace.headerToBody)
  await expect(gapBelow(label, rows)).toBe(formSpace.labelToControl)
  await expect(gapsBetweenChildren(rows)).toEqual([8, 8])
  for (const row of radios) {
    await expect(heightOf(row)).toBeGreaterThanOrEqual(44)
  }
  await expect(gapBelow(rows, hint)).toBe(formSpace.controlToHelper)
  await expect(hint).toHaveTextContent('The time you pick becomes the booking.')
  await expect(safety).toHaveTextContent(/Slashie never handles it/)
  await expect(booking).toHaveTextContent(/You will book this worker/)
  await expect(gapsBetweenChildren(column)).toEqual([
    formSpace.fieldGap,
    formSpace.fieldGap,
  ])
  await scrollToEnd(body)
  await expect(gapBelow(column, barButton(dialog, 'Accept quote'))).toBeCloseTo(
    formSpace.bodyToAction,
    0,
  )
  expectNoHorizontalOverflow(body)
}

/** Desktop: the gaps above. */
export const Spacing: Story = {
  play: ({ canvasElement }) => expectAcceptSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectAcceptSpacing(canvasElement)
  },
}

/** Nothing to pick: the label, then the message 8 under it (as under any label). */
export const SpacingNoFutureTimes: Story = {
  args: { slots: [{ id: 'slot-past', start: startIn(-2) }] },
  play: async ({ canvasElement }) => {
    const { body } = await openDialog(canvasElement, 'Accept this quote?')
    const group = bodyColumn(body).firstElementChild as HTMLElement
    const [label, message] = [...group.children] as HTMLElement[]

    await expect(message).toHaveTextContent(/times have passed/)
    await expect(gapBelow(label, message)).toBe(formSpace.labelToControl)
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  barButton,
  bodyColumn,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  expectSentenceConfirm,
  gapsBetweenChildren,
  openDialog,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, gapBeside } from '@/ui/FormField/formGap.testing'
import { expectField, scrollToEnd } from '@/ui/Modal/taskDialogSpacing.testing'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'
import { OrderCancelDialog, OrderRescheduleDialog } from './OrderRequestDialogs'

const order = storyTaskOrder({ bookedStart: '2030-06-10T09:00:00.000Z' })

const meta = {
  title: 'Task detail/Overview/OrderRequestDialogs',
  component: OrderRescheduleDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [withTaskDetailStory({ viewer: 'customer', order })],
  args: { open: true, onOpenChange: fn(), counterpartName: 'Jordan' },
} satisfies Meta<typeof OrderRescheduleDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The dialogs portal to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Propose one or two new times; the other person picks one or keeps the booking. */
export const Reschedule: Story = {
  play: async ({ canvasElement }) => {
    await page(canvasElement).findByRole('dialog', {
      name: 'Propose new times',
    })
  },
}

/** Sending without a day and start time shows what is missing. */
export const RescheduleMissingTime: Story = {
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Propose new times',
      }),
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Send request' }))
    await dialog.findByText('Pick a day and a start time.')
  },
}

/** Ask the other person to cancel; they must accept first. */
export const Cancel: Story = {
  render: (args) => <OrderCancelDialog {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Ask to cancel this booking?',
      }),
    )
    await dialog.findByText(
      'Jordan needs to accept before the booking is cancelled.',
    )
  },
}

/** Closed: nothing is on screen. */
export const Closed: Story = {
  args: { open: false },
  play: async ({ canvasElement }) => {
    const body = page(canvasElement)
    await new Promise((resolve) => setTimeout(resolve, 100))
    if (body.queryByRole('dialog')) {
      throw new Error('A dialog is open while the story is closed')
    }
  },
}

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges. The sentence is the Modal description (8 under the title) and the
 * picker is the body: the first slot card 24 under the description, the cards
 * and the Add button 20 apart, the last block 20 above the buttons. In a card the
 * heading is 12 above the day strip, the strip 20 above the fields, and each
 * field is 48 tall with its label 8 above.
 */
async function expectRescheduleSpacing(
  canvasElement: HTMLElement,
  layout: 'side by side' | 'stacked',
) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Propose new times',
  )
  const picker = bodyColumn(body)
  const [card, add] = [...picker.children] as HTMLElement[]
  const [heading, fields] = [...card.children] as HTMLElement[]
  const [strip, pairBlock] = [...fields.children] as HTMLElement[]
  const pair = pairBlock.firstElementChild as HTMLElement
  const [start, duration] = [...pair.children].map(
    (box) => box.firstElementChild,
  ) as HTMLElement[]

  await expect(dialog).toHaveAccessibleDescription(
    'Offer one or two times. Jordan picks one, or keeps the current time.',
  )
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, card)).toBe(
    formSpace.headerToBody,
  )
  await expect(gapBelow(heading, strip)).toBe(formSpace.sectionTitleToField)
  await expect(gapBelow(strip, pair)).toBe(formSpace.fieldGap)
  await expectField(start)
  await expectField(duration)
  if (layout === 'side by side') {
    await expect(gapBeside(start, duration)).toBe(formSpace.inlineGap)
  } else {
    await expect(gapBelow(start, duration)).toBe(formSpace.fieldGap)
  }
  await expect(add).toHaveTextContent('Add another time')
  await expect(gapsBetweenChildren(picker)).toEqual([formSpace.fieldGap])
  await scrollToEnd(body)
  await expect(gapBelow(picker, barButton(dialog, 'Send request'))).toBeCloseTo(
    formSpace.bodyToAction,
    0,
  )
  expectNoHorizontalOverflow(body)
}

/** Desktop (the large dialog): the fields sit side by side, 12 apart. */
export const RescheduleSpacing: Story = {
  play: ({ canvasElement }) =>
    expectRescheduleSpacing(canvasElement, 'side by side'),
}

/** Phone: the card is too narrow for both fields, so they stack 20 apart. */
export const RescheduleSpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectRescheduleSpacing(canvasElement, 'stacked')
  },
}

/** A slot's error sits 4 under its fields, and the body still ends 20 above the buttons. */
export const RescheduleErrorSpacing: Story = {
  play: async ({ canvasElement }) => {
    const { dialog, body } = await openDialog(
      canvasElement,
      'Propose new times',
    )
    await userEvent.click(barButton(dialog, 'Send request'))
    const error = await within(dialog).findByText(
      'Pick a day and a start time.',
    )
    const pair = bodyColumn(body).querySelector('[role="alert"]')
      ?.previousElementSibling as HTMLElement

    await expect(gapBelow(pair, error)).toBe(formSpace.controlToHelper)
    await scrollToEnd(body)
    await expect(
      gapBelow(bodyColumn(body), barButton(dialog, 'Send request')),
    ).toBeCloseTo(formSpace.bodyToAction, 0)
  },
}

/** Ask to cancel: the one sentence is the description, 8 under the title; the buttons are 24 under it. */
export const CancelSpacing: Story = {
  render: (args) => <OrderCancelDialog {...args} />,
  play: async ({ canvasElement }) => {
    await expectSentenceConfirm(
      await openDialog(canvasElement, 'Ask to cancel this booking?'),
      'Jordan needs to accept before the booking is cancelled.',
      'Ask to cancel',
    )
  },
}

/** Phone: the same gaps. */
export const CancelSpacingPhone: Story = {
  ...phone390,
  render: (args) => <OrderCancelDialog {...args} />,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectSentenceConfirm(
      await openDialog(canvasElement, 'Ask to cancel this booking?'),
      'Jordan needs to accept before the booking is cancelled.',
      'Ask to cancel',
    )
  },
}

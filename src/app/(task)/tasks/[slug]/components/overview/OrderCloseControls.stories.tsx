import { Box } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { openDialog } from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'
import { OrderCloseControls, OrderDoneDialog } from './OrderCloseControls'

/**
 * Closing a booking: once the booked time has started and you have not acted,
 * the Done card is one row with a slide. "Something went wrong" and switching
 * your answer later live in Help & actions (`OrderDoneDialog`,
 * `OrderFailedDialog`).
 */
const meta = {
  title: 'Task detail/Overview/OrderCloseControls',
  component: OrderCloseControls,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OrderCloseControls>

export default meta
type Story = StoryObj<typeof meta>

/** A booked worker whose time has started. */
const ready = withTaskDetailStory({ viewer: 'worker', order: storyTaskOrder() })

/** Rects of the Done card's parts, for the layout checks. */
function parts(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const card = canvasElement.querySelector(
    '[data-order-close-card]',
  ) as HTMLElement
  const eyebrow = canvas.getByText('Job time has started')
  const date = eyebrow.nextElementSibling as HTMLElement
  const thumb = canvas.getByRole('button', { name: 'Slide to mark Done' })
  const track = thumb.parentElement as HTMLElement
  const meaning = canvas.getByText(
    'Done means the work is finished and payment is settled.',
  )
  const r = (el: Element) => el.getBoundingClientRect()
  return { card, eyebrow, date, thumb, track, meaning, r }
}

/**
 * Booked time has started and the viewer has not acted: one row. The status
 * and the date on the left, a 48 tall slide filling the rest of the row on
 * the right (12 apart, at least 200 wide), and "what Done means" as one small
 * muted line, left aligned, 8 under the row. The card frame keeps its 16.
 */
export const Ready: Story = {
  decorators: [ready],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Slide to mark Done', { exact: false })
    const { card, eyebrow, date, thumb, track, meaning, r } =
      parts(canvasElement)

    await expect(eyebrow).toHaveStyle({ fontSize: '12px', fontWeight: '500' })
    await expect(date.textContent?.length).toBeGreaterThan(0)
    await expect(meaning).toHaveStyle({ fontSize: '12px', textAlign: 'start' })
    await expect(
      canvas.queryByRole('button', { name: 'Something went wrong' }),
    ).toBeNull()

    // The slide is 48 tall with a 40 thumb, and at least 200 wide.
    await expect(r(track).height).toBe(48)
    await expect(r(thumb).height).toBe(40)
    await expect(r(thumb).width).toBe(40)
    await expect(r(track).width).toBeGreaterThanOrEqual(200)

    // One row: text and slide share a top half, 12 apart, ends on the 16 padding.
    const text = eyebrow.parentElement as HTMLElement
    await expect(r(track).left - r(text).right).toBe(12)
    await expect(r(text).left - r(card).left).toBe(16)
    await expect(r(card).right - r(track).right).toBe(16)
    await expect(r(track).top - r(card).top).toBe(16)

    // The meaning: left aligned with the text, 8 under the row, 16 to the edge.
    await expect(r(meaning).left).toBe(r(text).left)
    await expect(r(meaning).top - r(track).bottom).toBe(8)
    await expect(r(card).bottom - r(meaning).bottom).toBe(16)
  },
}

/** A 390 phone's bottom bar (342 inside the card): still one row, the text wraps. */
export const PhoneRow: Story = {
  decorators: [
    ready,
    (Story) => (
      <Box w="374px">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Slide to mark Done', {
      exact: false,
    })
    const { eyebrow, track, r } = parts(canvasElement)
    const text = eyebrow.parentElement as HTMLElement
    await expect(r(track).width).toBeGreaterThanOrEqual(200)
    await expect(r(track).left).toBeGreaterThanOrEqual(r(text).right)
    await expect(r(text).top).toBeLessThan(r(track).bottom)
  },
}

/** Too narrow for text and slide (a very small phone): the slide wraps under, at full width. */
export const NarrowWraps: Story = {
  decorators: [
    ready,
    (Story) => (
      <Box w="304px">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Slide to mark Done', {
      exact: false,
    })
    const { card, eyebrow, track, meaning, r } = parts(canvasElement)
    const text = eyebrow.parentElement as HTMLElement
    await expect(r(track).left - r(card).left).toBe(16)
    await expect(r(card).right - r(track).right).toBe(16)
    await expect(r(track).height).toBe(48)
    await expect(r(track).top - r(text).bottom).toBe(12)
    await expect(r(meaning).top - r(track).bottom).toBe(8)
  },
}

/** Before the booked time (or once the booking is no longer live): nothing shows. */
export const NotClosable: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({
        bookedStart: '2030-06-10T14:00:00.000Z',
        bookedEnd: null,
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        within(canvasElement).queryByText('Slide to mark Done'),
      ).toBeNull(),
    )
  },
}

/** Booking in conflict: closing is closed, so nothing shows. */
export const NotLive: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      order: storyTaskOrder({ status: OrderStatus.Conflict }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        within(canvasElement).queryByText('Slide to mark Done'),
      ).toBeNull(),
    )
  },
}

/** After marking Failed: "Changed your mind?" opens a dialog with the slider. */
export const DoneDialog: Story = {
  decorators: [ready],
  render: () => <OrderDoneDialog open onOpenChange={fn()} />,
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Changed your mind? Mark it Done' },
    )
    await within(dialog).findByText('Slide to mark Done')
  },
}

/**
 * Form spacing (FE-481): the slide is the dialog's action, 24 under the title,
 * and the line saying what Done means is its helper, 4 under it. There is no bar,
 * so the body keeps its 24 at the bottom.
 */
export const DoneDialogSpacing: Story = {
  decorators: [ready],
  render: () => <OrderDoneDialog open onOpenChange={fn()} />,
  play: async ({ canvasElement }) => {
    const { dialog, title, footer, body } = await openDialog(
      canvasElement,
      'Changed your mind? Mark it Done',
    )
    // The thumb sits inside the track: the track is the control.
    const slide = within(dialog).getByRole('button', {
      name: 'Slide to mark Done',
    }).parentElement as HTMLElement
    const meaning = within(dialog).getByText(
      'Done means the work is finished and payment is settled.',
    )

    await expect(footer).toBeNull()
    await expect(gapBelow(title, slide)).toBe(formSpace.headerToBody)
    await expect(gapBelow(slide, meaning)).toBe(formSpace.controlToHelper)
    await expect(
      body.getBoundingClientRect().bottom -
        meaning.getBoundingClientRect().bottom,
    ).toBe(24)
  },
}

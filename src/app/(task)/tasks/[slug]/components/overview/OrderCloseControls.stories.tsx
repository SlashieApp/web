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
 * slide Done or say something went wrong. Switching your answer later lives in
 * Help & actions (`OrderDoneDialog`, `OrderFailedDialog`).
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

/** Booked time has started and the viewer has not acted. */
export const Ready: Story = {
  decorators: [ready],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Slide to mark Done')
    await canvas.findByText(
      'Done means the work is finished and payment is settled.',
    )
    await canvas.findByRole('button', { name: 'Something went wrong' })
  },
}

/** "Something went wrong" opens the reasons dialog. */
export const FailedDialogOpen: Story = {
  decorators: [ready],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Something went wrong' }),
    )
    await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: 'What went wrong?',
    })
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

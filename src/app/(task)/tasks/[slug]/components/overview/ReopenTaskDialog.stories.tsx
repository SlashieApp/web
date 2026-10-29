import {
  OrderPartyRole,
  OrderStatus,
  QuoteStatus,
  TaskBookingStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import {
  barButton,
  openDialog,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { ReopenTaskDialog } from './ReopenTaskDialog'

/**
 * Asks before the owner reopens the task for quotes (BE-108, BE-113). Opened
 * by the main button (a cancelled task, or a booking that was cancelled), or
 * by the notice on a booking whose worker is suspended.
 */
const meta = {
  title: 'Task detail/Overview/ReopenTaskDialog',
  component: ReopenTaskDialog,
  parameters: { layout: 'padded' },
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof ReopenTaskDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The dialog portals to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

const cancelled = withTaskDetailStory({
  viewer: 'owner',
  task: storyTaskDetail({ status: TaskStatus.Cancelled, canReopen: true }),
})

/** A cancelled task: it takes quotes again, and the quoting workers are told. */
export const CancelledTask: Story = {
  decorators: [cancelled],
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Reopen this task?',
      }),
    )
    await dialog.findByText(
      'It will be open for quotes again, and workers with pending quotes will be told.',
    )
    await expect(
      dialog.getByRole('button', { name: 'Reopen task' }),
    ).toBeInTheDocument()
    await expect(
      dialog.getByRole('button', { name: 'Not now' }),
    ).toBeInTheDocument()
  },
}

/** A booking whose worker is suspended: that booking is cancelled. */
export const BookingWithSuspendedWorker: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({
        status: TaskStatus.Awarded,
        bookingStatus: TaskBookingStatus.Booked,
        canReopen: true,
        quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
      }),
      order: storyTaskOrder({
        bookedStart: '2030-06-10T09:00:00.000Z',
        counterpartySuspension: {
          role: OrderPartyRole.Worker,
          name: 'Jordan Lee',
          canReopen: true,
        },
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Reopen this task?',
      }),
    )
    await dialog.findByText(
      'Your booking with Jordan Lee will be cancelled and the task will be open for quotes again. You can accept another quote.',
    )
  },
}

/**
 * A booking that was cancelled (BE-113): it is already cancelled, so the
 * dialog doesn't say it will be. The task takes quotes again.
 */
export const BookingCancelled: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({
        status: TaskStatus.Awarded,
        bookingStatus: TaskBookingStatus.None,
        canReopen: true,
        quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
      }),
      order: storyTaskOrder({
        status: OrderStatus.Cancelled,
        closedAt: '2026-06-10T17:00:00.000Z',
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const dialog = within(
      await page(canvasElement).findByRole('dialog', {
        name: 'Reopen this task?',
      }),
    )
    await dialog.findByText(
      'It will be open for quotes again, and workers with pending quotes will be told.',
    )
    await expect(dialog.queryByText(/will be cancelled/)).toBeNull()
  },
}

/** Closed: nothing is on screen. */
export const Closed: Story = {
  decorators: [cancelled],
  args: { open: false },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    await expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/** Form spacing (FE-481): the one sentence is the body, 24 under the title and 20 above the buttons. */
export const Spacing: Story = {
  decorators: [cancelled],
  play: async ({ canvasElement }) => {
    const { dialog, title, description } = await openDialog(
      canvasElement,
      'Reopen this task?',
    )
    const sentence = within(dialog).getByText(
      'It will be open for quotes again, and workers with pending quotes will be told.',
    )

    await expect(description).toBeNull()
    await expect(gapBelow(title, sentence)).toBe(formSpace.headerToBody)
    await expect(gapBelow(sentence, barButton(dialog, 'Reopen task'))).toBe(
      formSpace.bodyToAction,
    )
  },
}

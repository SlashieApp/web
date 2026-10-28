import { Box } from '@chakra-ui/react'
import {
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskBookingStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  STORY_OWNER_ID,
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'

/**
 * The task options menu: a popover on web, a bottom sheet on phones. It holds
 * the view's booking actions, then share, edit or repost, safety, help,
 * report and cancel. Booking actions open dialogs that outlive the menu.
 * Shown through its three-dots trigger, as the page header's bar uses it.
 */
const meta = {
  title: 'Task detail/Layout/TaskOverflowMenu',
  component: TaskHelpOverflowTrigger,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box minH="440px" display="flex" justifyContent="flex-end">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskHelpOverflowTrigger>

export default meta
type Story = StoryObj<typeof meta>

const desktop = { globals: { viewport: { value: 'desktop' } } } as const
const phone = { globals: { viewport: { value: 'mobile1' } } } as const

const FUTURE_START = '2030-06-10T09:00:00.000Z'
const FUTURE_END = '2030-06-10T11:00:00.000Z'

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

function menu(config: Partial<TaskDetailStoryConfig>) {
  return { decorators: [withTaskDetailStory(config)] }
}

/** Where the open menu renders: in place on web, in a sheet on phones. */
const surface = (canvasElement: HTMLElement, onPhone: boolean) =>
  onPhone ? within(canvasElement.ownerDocument.body) : within(canvasElement)

async function openMenu(canvasElement: HTMLElement, onPhone = false) {
  const canvas = within(canvasElement)
  await userEvent.click(
    await canvas.findByRole('button', { name: 'Task options' }),
  )
  return surface(canvasElement, onPhone)
}

/** Closed: just the three-dots button. */
export const Closed: Story = {
  ...desktop,
  ...menu({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = await canvas.findByRole('button', { name: 'Task options' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  },
}

/** Owner of an open task: share, edit, safety and Cancel task. */
export const OwnerOpenTask: Story = {
  ...desktop,
  ...menu({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Share task' })
    await panel.findByRole('link', { name: 'Edit task' })
    await panel.findByRole('link', { name: 'Paying & meeting safely' })
    expect(panel.queryByRole('link', { name: 'Get help' })).toBeNull()
    await panel.findByRole('button', { name: 'Cancel task' })
    expect(panel.queryByRole('button', { name: 'Report task' })).toBeNull()
  },
}

/** A visitor: share, safety and Report task; nothing to edit or cancel. */
export const Visitor: Story = {
  ...desktop,
  ...menu({ viewer: 'visitor' }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Report task' })
    expect(panel.queryByRole('link', { name: 'Edit task' })).toBeNull()
    expect(panel.queryByRole('button', { name: 'Cancel task' })).toBeNull()
  },
}

/** Owner of a finished job: Repost this task replaces edit and cancel. */
export const OwnerFinishedJob: Story = {
  ...desktop,
  ...menu({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Completed,
      closedAt: '2026-06-10T17:00:00.000Z',
    }),
  }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('link', { name: 'Repost this task' })
    expect(panel.queryByRole('link', { name: 'Edit task' })).toBeNull()
  },
}

/** Booked before the start time: Reschedule and Cancel booking come first. */
export const BookedBeforeStart: Story = {
  ...desktop,
  ...menu({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
  }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Reschedule' })
    await panel.findByRole('button', { name: 'Cancel booking' })
  },
}

/** Your own reschedule request is pending: Withdraw request. */
export const OwnRequestPending: Story = {
  ...desktop,
  ...menu({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Rescheduling,
      bookedStart: FUTURE_START,
      bookedEnd: FUTURE_END,
      pendingRequest: {
        kind: OrderRequestKind.Reschedule,
        requestedByUserId: STORY_OWNER_ID,
        requestedAt: '2026-10-15T10:00:00.000Z',
        proposedSlots: [
          {
            id: 'slot-r1',
            start: '2030-06-12T09:00:00.000Z',
            end: '2030-06-12T11:00:00.000Z',
          },
        ],
      },
    }),
  }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Withdraw request' })
  },
}

/** A conflict (one Done, one Failed): Ask to cancel and Report profile. */
export const Conflict: Story = {
  ...desktop,
  ...menu({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Conflict,
      myCloseAction: {
        kind: OrderCloseKind.Done,
        at: '2026-10-15T10:00:00.000Z',
      },
      counterpartyCloseAction: {
        kind: OrderCloseKind.Failed,
        at: '2026-10-15T10:00:00.000Z',
      },
    }),
  }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Ask to cancel' })
    await panel.findByRole('button', { name: 'Report profile' })
  },
}

/**
 * A worker whose quote is still pending once someone else is booked, or the
 * booking ended (BE-116): there is no booking to change, so Withdraw quote
 * comes first, then the task ones. Nothing is pressed: it would send it.
 */
function notOnTheBooking(
  bookingStatus: TaskBookingStatus,
  over: Partial<Parameters<typeof storyTaskDetail>[0]> = {},
) {
  return menu({
    viewer: 'worker',
    task: storyTaskDetail({
      status: TaskStatus.Awarded,
      bookingStatus,
      quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
      ...over,
    }),
  })
}

/** Booked by someone else: Withdraw quote, and no booking actions. */
export const WorkerBookedByOther: Story = {
  ...desktop,
  ...notOnTheBooking(TaskBookingStatus.Booked),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Withdraw quote' })
    await panel.findByRole('button', { name: 'Share task' })
    await panel.findByRole('button', { name: 'Report task' })
    expect(panel.queryByRole('button', { name: 'Reschedule' })).toBeNull()
    expect(panel.queryByRole('button', { name: 'Cancel booking' })).toBeNull()
  },
}

/** Someone else's job is complete: Withdraw quote. */
export const WorkerCompletedByOther: Story = {
  ...desktop,
  ...notOnTheBooking(TaskBookingStatus.Completed),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Withdraw quote' })
  },
}

/** The booking ended and the task isn't reopened: Withdraw quote. */
export const WorkerOtherBookingEnded: Story = {
  ...desktop,
  ...notOnTheBooking(TaskBookingStatus.None),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Withdraw quote' })
  },
}

/** Phone: Withdraw quote is in the sheet too. */
export const PhoneWorkerBookedByOther: Story = {
  ...phone,
  ...notOnTheBooking(TaskBookingStatus.Booked),
  play: async ({ canvasElement }) => {
    const sheet = await openMenu(canvasElement, true)
    await sheet.findByRole('button', { name: 'Withdraw quote' })
  },
}

/** A suspended task changes nothing, so there is nothing to withdraw (BE-108). */
export const WorkerBookedByOtherSuspended: Story = {
  ...desktop,
  ...notOnTheBooking(TaskBookingStatus.Booked, {
    suspension: { bySlashie: true, posterSuspended: false },
  }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Share task' })
    expect(panel.queryByRole('button', { name: 'Withdraw quote' })).toBeNull()
  },
}

/** A visitor with no quote of their own has nothing to withdraw. */
export const VisitorBookedTask: Story = {
  ...desktop,
  ...menu({ viewer: 'visitor', task: bookedTask }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await panel.findByRole('button', { name: 'Share task' })
    expect(panel.queryByRole('button', { name: 'Withdraw quote' })).toBeNull()
  },
}

/** Cancel booking closes the menu and opens its confirm dialog. */
export const CancelBookingOpensDialog: Story = {
  ...desktop,
  ...menu({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
  }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await userEvent.click(
      await panel.findByRole('button', { name: 'Cancel booking' }),
    )
    const page = within(canvasElement.ownerDocument.body)
    await page.findByRole('dialog', { name: 'Ask to cancel this booking?' })
  },
}

/** Cancel task closes the menu and asks first: nothing is cancelled yet. */
export const CancelTaskOpensDialog: Story = {
  ...desktop,
  ...menu({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await userEvent.click(
      await panel.findByRole('button', { name: 'Cancel task' }),
    )
    const page = within(canvasElement.ownerDocument.body)
    const dialog = within(
      await page.findByRole('dialog', { name: 'Cancel task' }),
    )
    await dialog.findByRole('button', { name: 'Keep' })
  },
}

/** Withdraw quote closes the menu and asks first: nothing is withdrawn yet. */
export const WithdrawQuoteOpensDialog: Story = {
  ...desktop,
  ...notOnTheBooking(TaskBookingStatus.Booked),
  play: async ({ canvasElement }) => {
    const panel = await openMenu(canvasElement)
    await userEvent.click(
      await panel.findByRole('button', { name: 'Withdraw quote' }),
    )
    const page = within(canvasElement.ownerDocument.body)
    const dialog = within(
      await page.findByRole('dialog', { name: 'Withdraw quote' }),
    )
    await dialog.findByRole('button', { name: 'Keep' })
  },
}

/** Phone: the same menu as a bottom sheet. */
export const PhoneOwnerOpenTask: Story = {
  ...phone,
  ...menu({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const sheet = await openMenu(canvasElement, true)
    await sheet.findByRole('dialog')
    await sheet.findByRole('button', { name: 'Cancel task' })
  },
}

/** Phone, booked: Reschedule opens its dialog and keeps it after the sheet closes. */
export const PhoneRescheduleOpensDialog: Story = {
  ...phone,
  ...menu({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
  }),
  play: async ({ canvasElement }) => {
    const sheet = await openMenu(canvasElement, true)
    await userEvent.click(
      await sheet.findByRole('button', { name: 'Reschedule' }),
    )
    await waitFor(() =>
      expect(
        sheet.getByRole('dialog', { name: 'Propose new times' }),
      ).toBeVisible(),
    )
  },
}

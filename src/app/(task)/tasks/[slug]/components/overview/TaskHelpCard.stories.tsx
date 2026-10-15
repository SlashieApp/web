import { Box } from '@chakra-ui/react'
import {
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import {
  STORY_OWNER_ID,
  STORY_WORKER_ID,
  type TaskDetailStoryConfig,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskHelpCard } from './TaskHelpCard'

/**
 * Desktop Help & actions: the view's booking actions first, then the task
 * ones. Phones get the same list from the title's options menu.
 */
const meta = {
  title: 'Task detail/Overview/TaskHelpCard',
  component: TaskHelpCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="380px" w="full">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskHelpCard>

export default meta
type Story = StoryObj<typeof meta>

const AT = '2026-10-15T10:00:00.000Z'
const FUTURE_START = '2030-06-10T09:00:00.000Z'
const FUTURE_END = '2030-06-10T11:00:00.000Z'
const done = { kind: OrderCloseKind.Done, at: AT }
const failed = { kind: OrderCloseKind.Failed, at: AT }

const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
})

function help(config: Partial<TaskDetailStoryConfig>) {
  return { decorators: [withTaskDetailStory(config)] }
}

/** The action rows by name, whichever role (link or button) they render as. */
function rows(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const find = (name: string | RegExp) =>
    canvas.queryByRole('link', { name }) ??
    canvas.queryByRole('button', { name })
  return {
    has: (name: string | RegExp) =>
      waitFor(() => {
        const row = find(name)
        expect(row).not.toBeNull()
        return row as HTMLElement
      }),
    lacks: (name: string | RegExp) => expect(find(name)).toBeNull(),
  }
}

// ---------------------------------------------------------- task-level

/** Owner of an open task: share, edit, safety, help and Cancel task. */
export const OwnerOpenTask: Story = {
  ...help({ viewer: 'owner' }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Share task')
    await r.has('Edit task')
    await r.has('Cancel task')
    r.lacks('Report task')
  },
}

/** A visitor: no edit or cancel, but Report task. */
export const Visitor: Story = {
  ...help({ viewer: 'visitor' }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Report task')
    r.lacks('Cancel task')
  },
}

/** A worker looking at someone else's open task: Report task, nothing to edit. */
export const WorkerOpenTask: Story = {
  ...help({ viewer: 'worker' }),
  play: async ({ canvasElement }) => {
    await rows(canvasElement).has('Report task')
  },
}

/** Owner of a finished job: Repost this task, no edit or cancel. */
export const OwnerFinishedJob: Story = {
  ...help({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Completed,
      closedAt: '2026-06-10T17:00:00.000Z',
    }),
  }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Repost this task')
    r.lacks('Cancel task')
  },
}

/** Owner of a cancelled task: Repost this task. */
export const OwnerCancelledTask: Story = {
  ...help({
    viewer: 'owner',
    task: storyTaskDetail({ status: TaskStatus.Cancelled }),
  }),
  play: async ({ canvasElement }) => {
    await rows(canvasElement).has('Repost this task')
  },
}

/** Task still loading: the card shows its heading and nothing else yet. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Help & actions')
  },
}

// ------------------------------------------------------------- booking

/** Owner, booked, before the start: Reschedule and Cancel booking first. */
export const OwnerBookedBeforeStart: Story = {
  ...help({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
  }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Reschedule')
    await r.has('Cancel booking')
  },
}

/** Booked worker, before the start: the same two booking actions. */
export const WorkerBookedBeforeStart: Story = {
  ...help({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
  }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Reschedule')
    await r.has('Cancel booking')
  },
}

/** After the start time nobody has acted: no booking actions, just the task ones. */
export const BookedTimeStarted: Story = {
  ...help({ viewer: 'worker', task: bookedTask, order: storyTaskOrder() }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Share task')
    r.lacks('Reschedule')
    r.lacks('Cancel booking')
  },
}

/** Your own reschedule request is waiting: Withdraw request. */
export const OwnRescheduleRequest: Story = {
  ...help({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Rescheduling,
      bookedStart: FUTURE_START,
      bookedEnd: FUTURE_END,
      pendingRequest: {
        kind: OrderRequestKind.Reschedule,
        requestedByUserId: STORY_OWNER_ID,
        requestedAt: AT,
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
    await rows(canvasElement).has('Withdraw request')
  },
}

/** Your own cancellation request is waiting: Withdraw request. */
export const OwnCancelRequest: Story = {
  ...help({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.CancelRequested,
      bookedStart: FUTURE_START,
      bookedEnd: FUTURE_END,
      pendingRequest: {
        kind: OrderRequestKind.Cancel,
        requestedByUserId: STORY_WORKER_ID,
        requestedAt: AT,
        proposedSlots: [],
      },
    }),
  }),
  play: async ({ canvasElement }) => {
    await rows(canvasElement).has('Withdraw request')
  },
}

/** The other person's request is waiting: no booking action, you answer in the summary. */
export const TheirRequestWaiting: Story = {
  ...help({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.CancelRequested,
      bookedStart: FUTURE_START,
      bookedEnd: FUTURE_END,
      pendingRequest: {
        kind: OrderRequestKind.Cancel,
        requestedByUserId: STORY_WORKER_ID,
        requestedAt: AT,
        proposedSlots: [],
      },
    }),
  }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Share task')
    r.lacks('Withdraw request')
  },
}

/** Conflict (you Done, they Failed): Ask to cancel and Report profile. */
export const Conflict: Story = {
  ...help({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      status: OrderStatus.Conflict,
      myCloseAction: done,
      counterpartyCloseAction: failed,
    }),
  }),
  play: async ({ canvasElement }) => {
    const r = rows(canvasElement)
    await r.has('Ask to cancel')
    await r.has('Report profile')
  },
}

/** You marked it Done and are waiting: "Something went wrong?". */
export const IMarkedDone: Story = {
  ...help({
    viewer: 'owner',
    task: bookedTask,
    order: storyTaskOrder({
      myCloseAction: done,
      autoDoneAt: '2026-10-22T10:00:00.000Z',
    }),
  }),
  play: async ({ canvasElement }) => {
    await rows(canvasElement).has('Something went wrong?')
  },
}

/** You marked it Failed and are waiting: "Changed your mind? Mark it Done". */
export const IMarkedFailed: Story = {
  ...help({
    viewer: 'worker',
    task: bookedTask,
    order: storyTaskOrder({ myCloseAction: failed }),
  }),
  play: async ({ canvasElement }) => {
    await rows(canvasElement).has('Changed your mind? Mark it Done')
  },
}

// ------------------------------------------------------------- dialogs

/** The page-level dialog a row opens. */
const dialog = (canvasElement: HTMLElement, name: string) =>
  within(canvasElement.ownerDocument.body).findByRole('dialog', { name })

/** Reschedule opens its dialog for proposing new times. */
export const RescheduleDialog: Story = {
  ...OwnerBookedBeforeStart,
  play: async ({ canvasElement }) => {
    await userEvent.click(await rows(canvasElement).has('Reschedule'))
    await dialog(canvasElement, 'Propose new times')
  },
}

/** Cancel booking opens the confirm dialog. */
export const CancelBookingDialog: Story = {
  ...WorkerBookedBeforeStart,
  play: async ({ canvasElement }) => {
    await userEvent.click(await rows(canvasElement).has('Cancel booking'))
    await dialog(canvasElement, 'Ask to cancel this booking?')
  },
}

/** "Something went wrong?" opens the reasons dialog. */
export const MarkFailedDialog: Story = {
  ...IMarkedDone,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await rows(canvasElement).has('Something went wrong?'),
    )
    await dialog(canvasElement, 'What went wrong?')
  },
}

/** "Changed your mind?" opens the slide-to-Done dialog. */
export const MarkDoneDialog: Story = {
  ...IMarkedFailed,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await rows(canvasElement).has('Changed your mind? Mark it Done'),
    )
    await dialog(canvasElement, 'Changed your mind? Mark it Done')
  },
}

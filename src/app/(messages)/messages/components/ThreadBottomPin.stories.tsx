import {
  OrderRequestKind,
  OrderStatus,
  ThreadAttentionKind,
} from '@codegen/schema'
import type { ThreadFieldsFragment } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import {
  STORY_OWNER_ID,
  STORY_TASK_ID,
  STORY_WORKER_ID,
  storyTaskDetail,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import type { TaskDetailRecord } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { ThreadBottomPin } from './ThreadBottomPin'
import { ThreadPin } from './ThreadPin'
import { messagesStory } from './messagesStoryDecorator'
import {
  FUTURE_END,
  FUTURE_START,
  type MessagesViewer,
  bookedTask,
  markedDone,
  markedFailed,
  needs,
  requestedOrder,
} from './messagesStoryFixtures'

/**
 * The bottom pin above the composer, one story per ask (see
 * `views/README.md`), inside the task's detail context as the thread mounts
 * it. Alex owns the task; Jordan is the booked worker.
 */
const meta = {
  title: 'Messages/ThreadBottomPin',
  component: ThreadBottomPin,
  parameters: { layout: 'fullscreen' },
  args: { attention: null },
  render: (args) => (
    <TaskDetailProvider taskId={STORY_TASK_ID} captureView={false}>
      <ThreadBottomPin {...args} />
    </TaskDetailProvider>
  ),
} satisfies Meta<typeof ThreadBottomPin>

export default meta
type Story = StoryObj<typeof meta>

/** A bottom pin story; `attention` is what the API says waits on the viewer. */
function ask(
  viewer: MessagesViewer,
  task: TaskDetailRecord,
  attention: ThreadFieldsFragment['attention'],
): Story {
  return { args: { attention }, decorators: messagesStory({ viewer, task }) }
}

/** Waits for the task to load and the pin to show the given view. */
const shows = async (canvasElement: HTMLElement, view: string) => {
  await waitFor(() =>
    expect(
      canvasElement.querySelector(`[data-bottom-pin="${view}"]`),
    ).toBeVisible(),
  )
  return within(canvasElement)
}

const rescheduleTask = bookedTask(
  requestedOrder(OrderRequestKind.Reschedule, STORY_WORKER_ID),
)

/** bottomPin.reschedule: Jordan wants to move the booking: Alex picks a time or keeps it. */
export const Reschedule: Story = {
  ...ask('owner', rescheduleTask, needs(ThreadAttentionKind.AnswerReschedule)),
  play: async ({ canvasElement }) => {
    const canvas = await shows(canvasElement, 'bottomPin.reschedule')
    await expect(
      canvas.getByRole('region', { name: 'Needs you' }),
    ).toBeVisible()
    await expect(
      canvas.getByText('Jordan Lee wants to move the booking'),
    ).toBeVisible()
    await expect(
      canvas.getAllByRole('button', { name: 'Use this time' }),
    ).toHaveLength(2)
    await expect(
      canvas.getByRole('button', { name: 'Keep current time' }),
    ).toBeVisible()
  },
}

/** bottomPin.cancel: Alex asked to cancel: Jordan accepts or keeps the booking. */
export const Cancel: Story = {
  ...ask(
    'worker',
    bookedTask(requestedOrder(OrderRequestKind.Cancel, STORY_OWNER_ID)),
    needs(ThreadAttentionKind.AnswerCancel),
  ),
  play: async ({ canvasElement }) => {
    const canvas = await shows(canvasElement, 'bottomPin.cancel')
    await expect(canvas.getByText('Alex Chen asked to cancel')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Accept cancellation' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Keep booking' }),
    ).toBeVisible()
  },
}

/** bottomPin.markDone: the booked start has passed: slide to mark Done, or report a problem. */
export const MarkDone: Story = {
  ...ask('worker', bookedTask(), needs(ThreadAttentionKind.MarkDone)),
  play: async ({ canvasElement }) => {
    const canvas = await shows(canvasElement, 'bottomPin.markDone')
    await expect(canvas.getByText('Job time has started')).toBeVisible()
    await expect(canvas.getByText('Slide to mark Done')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Something went wrong' }),
    ).toBeVisible()
  },
}

/** bottomPin.confirmDone: Jordan marked it Done: Alex marks it Done too. */
export const ConfirmDone: Story = {
  ...ask(
    'owner',
    bookedTask({
      counterpartyCloseAction: markedDone,
      autoDoneAt: '2026-10-22T10:00:00.000Z',
    }),
    needs(ThreadAttentionKind.ConfirmDone),
  ),
  play: async ({ canvasElement }) => {
    const canvas = await shows(canvasElement, 'bottomPin.confirmDone')
    await expect(canvas.getByText('Jordan Lee marked it Done')).toBeVisible()
    await expect(canvas.getByText(/completes automatically on/)).toBeVisible()
    await expect(canvas.getByText('Slide to mark Done')).toBeVisible()
  },
}

/** bottomPin.answerFailed: Alex marked it Failed: Jordan marks it Done if it went ahead. */
export const AnswerFailed: Story = {
  ...ask(
    'worker',
    bookedTask({ counterpartyCloseAction: markedFailed }),
    needs(ThreadAttentionKind.AnswerFailed),
  ),
  play: async ({ canvasElement }) => {
    const canvas = await shows(canvasElement, 'bottomPin.answerFailed')
    await expect(canvas.getByText('Alex Chen marked it Failed')).toBeVisible()
    await expect(canvas.getByText('Slide to mark Done')).toBeVisible()
  },
}

/** bottomPin.conflict: Done on one side, Failed on the other: open the task. */
export const Conflict: Story = {
  ...ask(
    'owner',
    bookedTask({
      status: OrderStatus.Conflict,
      myCloseAction: markedDone,
      counterpartyCloseAction: markedFailed,
    }),
    needs(ThreadAttentionKind.Conflict),
  ),
  play: async ({ canvasElement }) => {
    const canvas = await shows(canvasElement, 'bottomPin.conflict')
    await expect(canvas.getByText('This booking needs resolving')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Open task' }),
    ).toHaveAttribute('href', `/tasks/${STORY_TASK_ID}`)
  },
}

/** With the top pin, so a story can wait for the task before checking there's no ask. */
const withTopPin: Story['render'] = (args) => (
  <TaskDetailProvider taskId={STORY_TASK_ID} captureView={false}>
    <ThreadPin attention={args.attention} />
    <ThreadBottomPin {...args} />
  </TaskDetailProvider>
)

/** Waits for the task (the top pin) and checks the bottom pin stayed hidden. */
const hidden = async (canvasElement: HTMLElement) => {
  await waitFor(() =>
    expect(canvasElement.querySelector('[data-thread-pin]')).toBeVisible(),
  )
  await expect(canvasElement.querySelector('[data-bottom-pin]')).toBeNull()
}

/** Booked and before the start: nothing needs Alex, so there is no bottom pin. */
export const NothingNeeded: Story = {
  ...ask(
    'owner',
    bookedTask({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
    null,
  ),
  render: withTopPin,
  play: async ({ canvasElement }) => hidden(canvasElement),
}

/** Quotes to compare: the quote cards in the timeline handle it, not this pin. */
export const CompareQuotes: Story = {
  ...ask(
    'owner',
    storyTaskDetail(),
    needs(ThreadAttentionKind.CompareQuotes, 2),
  ),
  render: withTopPin,
  play: async ({ canvasElement }) => hidden(canvasElement),
}

/** Alex already marked it Done while the API still says Mark Done: hidden. */
export const AlreadyAnswered: Story = {
  ...ask(
    'owner',
    bookedTask({ myCloseAction: markedDone }),
    needs(ThreadAttentionKind.MarkDone),
  ),
  render: withTopPin,
  play: async ({ canvasElement }) => hidden(canvasElement),
}

/** zh-HK: the reschedule answer in Traditional Chinese. */
export const ZhHk: Story = {
  ...Reschedule,
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({ viewer: 'owner', task: rescheduleTask }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = await shows(canvasElement, 'bottomPin.reschedule')
    await expect(canvas.getByText('Jordan Lee 想更改預約時間')).toBeVisible()
    await expect(canvas.getByRole('region', { name: '待你處理' })).toBeVisible()
  },
}

/** Phones: the answer buttons stay in the pin. */
export const Phone: Story = {
  ...Reschedule,
  globals: { viewport: { value: 'mobile1' } },
}

import {
  OrderStatus,
  QuoteStatus,
  TaskStatus,
  TaskTimelineEventType,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import {
  STORY_ALEX,
  STORY_JORDAN,
  storyOwnerTimeline,
  storyPublicQuote,
  storyPublicTimeline,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
  storyTimelineEvent,
  storyWorkerTimeline,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskActivityCard } from './TaskActivityLog'

/**
 * The Activity log (FE-372): one line per event, oldest first, worded for
 * the viewer, with an icon for its kind and the date and time. This is the
 * desktop rail card; phones open the same log from `TaskActivityTrigger`.
 */
const meta = {
  title: 'Task detail/Overview/TaskActivityLog',
  component: TaskActivityCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '380px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TaskActivityCard>

export default meta
type Story = StoryObj<typeof meta>

const E = TaskTimelineEventType

/** A finished job: Jordan was booked, did the work and was reviewed. */
const finishedJob = {
  status: TaskStatus.Awarded,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
}
const completedOrder = storyTaskOrder({
  status: OrderStatus.Completed,
  closedAt: '2026-06-10T19:10:00.000Z',
})

/** The log's lines, in order. */
async function expectLines(canvasElement: HTMLElement, lines: string[]) {
  const canvas = within(canvasElement)
  await canvas.findByText(lines[0])
  const items = canvas.getAllByRole('listitem')
  await expect(
    items.map((item) => item.querySelector('p')?.textContent),
  ).toEqual(lines)
  // Every line says when, in a machine-readable <time> as well.
  for (const item of items) {
    const time = item.querySelector('time')
    await expect(time?.getAttribute('dateTime')).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    await expect(time?.textContent).toMatch(/\d{2}:\d{2}$/)
  }
}

/** The owner: every line, with names, from posting to the review. */
export const Owner: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ ...finishedJob, timeline: storyOwnerTimeline() }),
      order: completedOrder,
    }),
  ],
  play: ({ canvasElement }) =>
    expectLines(canvasElement, [
      'You posted the task',
      'You edited the task: budget and timing',
      'Jordan Lee sent a quote',
      'Sam Taylor sent a quote',
      'Jordan Lee updated their quote',
      'You booked Jordan Lee',
      "Sam Taylor's quote wasn't selected",
      'Jordan Lee asked for a new time',
      'You accepted the new time',
      'Jordan Lee marked the job done',
      'You marked the job done',
      'Job completed',
      'You left a review',
    ]),
}

/** The booked worker: their own lines say "you", the other quote has no name. */
export const BookedWorker: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({
        ...finishedJob,
        timeline: storyWorkerTimeline(),
      }),
      order: completedOrder,
    }),
  ],
  play: async ({ canvasElement }) => {
    await expectLines(canvasElement, [
      'Alex Chen posted the task',
      'Alex Chen edited the task: budget and timing',
      'You sent a quote',
      'A worker sent a quote',
      'You updated your quote',
      'Alex Chen accepted your quote',
      'You asked for a new time',
      'Alex Chen accepted the new time',
      'You marked the job done',
      'Alex Chen marked the job done',
      'Job completed',
    ])
    await expect(within(canvasElement).queryByText(/Sam Taylor/)).toBeNull()
  },
}

/** A worker who wasn't chosen: their quote's outcome, and an unnamed booking. */
export const WorkerNotSelected: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'worker',
      task: storyTaskDetail({
        status: TaskStatus.Awarded,
        quotes: [storyTaskQuote({ status: QuoteStatus.NotSelected })],
        timeline: [
          storyTimelineEvent({
            type: E.TaskCreated,
            timestamp: '2026-06-01T09:00:00.000Z',
            actor: STORY_ALEX,
          }),
          storyTimelineEvent({
            type: E.QuoteSent,
            timestamp: '2026-06-01T11:15:00.000Z',
            byViewer: true,
            actor: STORY_JORDAN,
            worker: STORY_JORDAN,
          }),
          storyTimelineEvent({
            type: E.QuoteSent,
            timestamp: '2026-06-01T12:40:00.000Z',
          }),
          storyTimelineEvent({
            type: E.QuoteAccepted,
            timestamp: '2026-06-02T08:20:00.000Z',
          }),
          storyTimelineEvent({
            type: E.QuoteNotSelected,
            timestamp: '2026-06-02T08:20:00.000Z',
            worker: STORY_JORDAN,
          }),
        ],
      }),
    }),
  ],
  play: ({ canvasElement }) =>
    expectLines(canvasElement, [
      'Alex Chen posted the task',
      'You sent a quote',
      'A worker sent a quote',
      'A worker was booked',
      "Your quote wasn't selected",
    ]),
}

/** Signed out, task open: the poster's lines, and quotes with no names. */
export const Visitor: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        quotes: [
          storyPublicQuote(),
          storyPublicQuote({ id: 'quote-public-2' }),
        ],
        timeline: storyPublicTimeline(),
      }),
    }),
  ],
  play: ({ canvasElement }) =>
    expectLines(canvasElement, [
      'Alex Chen posted the task',
      'Alex Chen edited the task: budget',
      'A worker sent a quote',
      'A worker sent a quote',
      'A worker withdrew their quote',
    ]),
}

/**
 * The owner's guest preview: their own log read as a guest gets it. Task
 * lines keep the poster, quote lines lose who, booking lines and reviews go.
 */
export const OwnerGuestPreview: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      viewAs: 'guest',
      task: storyTaskDetail({ ...finishedJob, timeline: storyOwnerTimeline() }),
      order: completedOrder,
    }),
  ],
  play: ({ canvasElement }) =>
    expectLines(canvasElement, [
      'Alex Chen posted the task',
      'Alex Chen edited the task: budget and timing',
      'A worker sent a quote',
      'A worker sent a quote',
      'A worker updated their quote',
      'A worker was booked',
      "A quote wasn't selected",
    ]),
}

/** Lines with nobody to name (an ops edit) read without one; unknown types are left out. */
export const NoNamesAndUnknownTypes: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({
        timeline: [
          storyTimelineEvent({
            type: E.TaskCreated,
            timestamp: '2026-06-01T09:00:00.000Z',
          }),
          storyTimelineEvent({
            // A type this build doesn't know yet.
            type: 'QUOTE_PINNED' as TaskTimelineEventType,
            timestamp: '2026-06-01T10:00:00.000Z',
          }),
          storyTimelineEvent({
            type: E.TaskUpdated,
            timestamp: '2026-06-01T11:00:00.000Z',
          }),
          storyTimelineEvent({
            type: E.TaskCancelled,
            timestamp: '2026-06-02T09:00:00.000Z',
          }),
        ],
      }),
    }),
  ],
  play: ({ canvasElement }) =>
    expectLines(canvasElement, [
      'Task posted',
      'The task was edited',
      'The task was cancelled',
    ]),
}

/** Nothing recorded for this viewer yet: the empty line. */
export const Empty: Story = {
  decorators: [
    withTaskDetailStory({
      viewer: 'visitor',
      task: storyTaskDetail({ timeline: [] }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Nothing has happened on this task yet.')
    expect(canvas.queryByRole('listitem')).toBeNull()
  },
}

/** The task itself is still loading: placeholder lines in the card. */
export const Loading: Story = {
  decorators: [withTaskDetailPending('loading')],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Activity')
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy]')).not.toBeNull(),
    )
  },
}

/** The task is in but the viewer's history isn't yet: placeholder lines. */
export const HistoryLoading: Story = {
  decorators: [withTaskDetailPending('viewerLoading')],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Activity')
    await waitFor(() =>
      expect(canvasElement.querySelector('[aria-busy]')).not.toBeNull(),
    )
    expect(within(canvasElement).queryByRole('listitem')).toBeNull()
  },
}

/** zh-HK: the owner's log in Chinese, with zh-HK dates. */
export const ZhHk: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/zh-hk/tasks/task-detail-story-1' } },
  },
  decorators: [
    withTaskDetailStory({
      viewer: 'owner',
      task: storyTaskDetail({ ...finishedJob, timeline: storyOwnerTimeline() }),
      order: completedOrder,
    }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('動態')
    for (const line of [
      '你發布了這個任務',
      '你修改了任務：預算、時間',
      'Jordan Lee 送出了報價',
      '你預約了 Jordan Lee',
      'Sam Taylor 的報價未獲選',
      'Jordan Lee 要求改期',
      '工作已完成',
      '你留下了評價',
    ]) {
      await canvas.findByText(line)
    }
    const [first] = canvas.getAllByRole('listitem')
    await expect(first.querySelector('time')?.textContent).toMatch(
      /月\d{1,2}日 \d{2}:\d{2}$/,
    )
  },
}

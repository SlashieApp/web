import { QuoteStatus, TaskStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import {
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailTabs } from './TaskDetailTabs'

/** The connected tab layout: title, chips, main button, Overview and the rail. */
const meta = {
  title: 'Task detail/Layout/TaskDetailTabs',
  component: TaskDetailTabs,
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'desktop' } },
} satisfies Meta<typeof TaskDetailTabs>

export default meta
type Story = StoryObj<typeof meta>

const wide = { maxWidth: '1100px' }

/** The summary headline names the view this viewer sees. */
async function expectView(
  canvasElement: HTMLElement,
  headline: string | RegExp,
) {
  await within(canvasElement).findByRole(
    'heading',
    { level: 2, name: headline },
    { timeout: 4000 },
  )
}

/** Owner of an open task with two quotes. */
export const OwnerWithQuotes: Story = {
  decorators: [withTaskDetailStory({ viewer: 'owner' }, wide)],
  play: async ({ canvasElement }) =>
    expectView(canvasElement, '2 quotes - compare and accept'),
}

/** Owner of an open task with no quotes yet. */
export const OwnerNoQuotes: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'owner', task: storyTaskDetail({ quotes: [] }) },
      wide,
    ),
  ],
  play: async ({ canvasElement }) =>
    expectView(canvasElement, 'Your task is live - reaching workers'),
}

/** Worker who has not quoted: the budget lives in the main button, not Overview. */
export const WorkerNotQuoted: Story = {
  decorators: [
    withTaskDetailStory(
      { viewer: 'worker', task: storyTaskDetail({ quotes: [] }) },
      wide,
    ),
  ],
  play: async ({ canvasElement }) =>
    expectView(canvasElement, 'Open for quotes'),
}

/** Worker whose quote awaits review: the main button becomes Edit quote. */
export const WorkerQuoteSent: Story = {
  decorators: [withTaskDetailStory({ viewer: 'worker' }, wide)],
  play: async ({ canvasElement }) => expectView(canvasElement, 'Quote sent'),
}

/** Signed out: earn line, Sign in to quote, no owner-only cards. */
export const Visitor: Story = {
  decorators: [withTaskDetailStory({ viewer: 'visitor' }, wide)],
  play: async ({ canvasElement }) => expectView(canvasElement, /You can earn/),
}

/** Booked owner: the booking summary with the worker's contact details. */
export const OwnerBooked: Story = {
  decorators: [
    withTaskDetailStory(
      {
        viewer: 'owner',
        task: storyTaskDetail({
          status: TaskStatus.Awarded,
          quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
        }),
        order: storyTaskOrder({
          bookedStart: '2030-06-10T09:00:00.000Z',
          bookedEnd: '2030-06-10T11:00:00.000Z',
        }),
      },
      wide,
    ),
  ],
  play: async ({ canvasElement }) => expectView(canvasElement, 'Worker booked'),
}

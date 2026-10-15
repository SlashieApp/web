import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { quoteStoryTask, withQuoteStory } from '../../taskQuoteStoryFixtures'
import { TaskQuoteTaskDetailPanel } from './TaskQuoteTaskDetailPanel'

const meta = {
  title: 'Quote flow/TaskQuoteTaskDetailPanel',
  component: TaskQuoteTaskDetailPanel,
  parameters: {
    layout: 'padded',
  },
  args: {
    backHref: '/tasks/task-detail-story-1',
  },
} satisfies Meta<typeof TaskQuoteTaskDetailPanel>

export default meta
type Story = StoryObj<typeof meta>

const panel = (task: Parameters<typeof quoteStoryTask>[0] = {}) => [
  withQuoteStory({ task: quoteStoryTask(task) }, { maxWidth: '420px' }),
]

/** Desktop aside: a raised card with the back link, title and description. */
export const Sidebar: Story = { decorators: panel() }

/** Phones: a flat section above the progress bar, with a bottom rule. */
export const Section: Story = {
  args: { variant: 'section' },
  decorators: panel(),
  globals: { viewport: { value: 'mobile1' } },
}

/** The task has no description: a short placeholder line shows instead. */
export const NoDescription: Story = {
  decorators: panel({ description: '' }),
}

/** A long title and a long description wrap inside the card. */
export const LongText: Story = {
  decorators: panel({
    title:
      'Mount a large bookshelf and two floating shelves on the living room wall',
    description:
      'Need a worker to mount one large IKEA bookshelf and two floating shelves safely. The wall is plasterboard with a stud about 40cm from the corner, and fixings are supplied. Please bring your own drill and a spirit level, and remove all the packaging afterwards. Parking is available on the street outside.',
  }),
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import type { MyTaskHubRow } from '../../helpers/myTasksHub'
import { MyTasksHubCard } from './MyTasksHubCard'

const row: MyTaskHubRow = {
  id: 'cleaning',
  title: 'Deep clean a two-bedroom flat',
  description: '',
  location: 'Westminster',
  priceLabel: '£22',
  categories: ['CLEANING'],
  categoryLabel: 'Cleaning',
  ownerUserId: 'me',
  ownerName: 'Sam',
  roles: ['hosted'],
  section: 'open',
  timing: { kind: 'before', date: '2026-09-27' },
  quoteCount: 0,
  acceptedWorkerName: null,
}

/** One row of the My tasks hub: title, status, price, timing, place, detail. */
const meta = {
  title: 'My tasks/MyTasksHubCard',
  component: MyTasksHubCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    row,
    timingLabel: 'Before 27 Sep',
    tags: ['Hosted'],
    statusLabel: 'Open',
    section: 'open',
    activateAriaLabel:
      'Deep clean a two-bedroom flat. Hosted. Open. Before 27 Sep. Open task',
    onOpen: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyTasksHubCard>

export default meta
type Story = StoryObj<typeof meta>

/** Your open task with no quotes yet; pressing the card opens it. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: /Deep clean a two-bedroom flat/,
      }),
    )
    await expect(args.onOpen).toHaveBeenCalledWith('cleaning')
  },
}

/** Your open task with quotes: the detail line counts them. */
export const WithQuotes: Story = {
  args: {
    detail: '3 quotes',
    row: { ...row, quoteCount: 3 },
  },
}

/** Booked: the Booked badge and who the job is with. */
export const Booked: Story = {
  args: {
    statusLabel: 'Booked',
    section: 'booked',
    detail: 'With RK K',
    tags: ['Hosted'],
    row: {
      ...row,
      id: 'booked',
      categories: ['HANDYMAN'],
      categoryLabel: 'Handyman',
      priceLabel: '£1',
      section: 'booked',
      acceptedWorkerName: 'RK K',
    },
  },
}

/** Completed: a neutral badge instead of the green one. */
export const Completed: Story = {
  args: {
    statusLabel: 'Completed',
    section: 'completed',
    detail: 'With RK K',
    tags: ['Quoted'],
    row: {
      ...row,
      id: 'done',
      categories: ['GENERAL'],
      categoryLabel: 'General / other',
      priceLabel: '£983',
      section: 'completed',
      roles: ['quoted'],
    },
  },
}

/** A task you quoted on, hosted by someone else. */
export const QuotedByMe: Story = {
  args: {
    tags: ['Quoted'],
    detail: 'Hosted by Alex',
    row: {
      ...row,
      ownerUserId: 'alex',
      ownerName: 'Alex',
      roles: ['quoted'],
    },
  },
}

/** You posted it and also quoted on it: both role tags. */
export const HostedAndQuoted: Story = {
  args: { tags: ['Hosted', 'Quoted'] },
}

/** Overdue timing. */
export const Overdue: Story = {
  args: { timingLabel: 'Overdue' },
}

/** No budget: the price is left out of the meta line. */
export const NoPrice: Story = {
  args: { row: { ...row, priceLabel: '' } },
}

/** No place and no category: the meta line shortens. */
export const NoPlaceNoCategory: Story = {
  args: { row: { ...row, location: '', categoryLabel: null } },
}

/** The task has a photo: it replaces the placeholder tile. */
export const WithPhoto: Story = {
  args: {
    row: {
      ...row,
      thumbnailSrc: `data:image/svg+xml;utf8,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#7aa17a"/></svg>',
      )}`,
    },
  },
}

/** A long title clamps to two lines. */
export const LongTitle: Story = {
  args: {
    row: {
      ...row,
      title:
        'Deep clean a two-bedroom flat, including the oven, the fridge, all windows inside and out, and the balcony, before the landlord inspection',
    },
  },
}

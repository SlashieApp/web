import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { MyTaskHubRow } from '../../helpers/myTasksHub'
import { MyTasksHubCard } from './MyTasksHubCard'

const row: MyTaskHubRow = {
  id: 'cleaning',
  title: 'open task',
  description: '',
  location: 'Westminster, London',
  priceLabel: '£22',
  category: 'CLEANING',
  categoryLabel: 'Cleaning',
  ownerUserId: 'me',
  ownerName: 'Sam',
  roles: ['hosted'],
  section: 'open',
  timing: { kind: 'before', date: '2026-09-27' },
  quoteCount: 0,
  acceptedWorkerName: null,
}

const meta = {
  title: 'task/tasks/ui/MyTasksHubCard',
  component: MyTasksHubCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    row,
    timingLabel: 'Before 2026-09-27',
    tags: ['Hosted'],
    statusLabel: 'Open',
    section: 'open',
    activateAriaLabel: 'open task. Hosted. Open. Before 2026-09-27. Open task',
    onOpen: () => undefined,
  },
} satisfies Meta<typeof MyTasksHubCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Booked: Story = {
  args: {
    statusLabel: 'Booked',
    section: 'booked',
    detail: 'With RK K',
    tags: ['Hosted'],
    row: {
      ...row,
      id: 'booked',
      category: 'HANDYMAN',
      categoryLabel: 'Handyman',
      priceLabel: '£1',
      section: 'booked',
      acceptedWorkerName: 'RK K',
    },
  },
}

export const Completed: Story = {
  args: {
    statusLabel: 'Completed',
    section: 'completed',
    detail: 'With RK K',
    tags: ['Quoted'],
    row: {
      ...row,
      id: 'done',
      category: 'GENERAL',
      categoryLabel: 'General / other',
      priceLabel: '£983',
      section: 'completed',
      roles: ['quoted'],
    },
  },
}

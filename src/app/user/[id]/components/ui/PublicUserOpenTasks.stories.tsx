import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'

import { PublicUserOpenTasks } from './PublicUserOpenTasks'

const tasks: TaskCardTask[] = [
  {
    id: 'task-1',
    title: 'Fix a leaking tap',
    description: 'Kitchen tap drips overnight.',
    location: 'Kennedy Town',
    priceLabel: '£85',
    badgeText: 'Handyman',
    timingLabel: 'Flexible',
  },
  {
    id: 'task-2',
    title: 'Move a sofa across town',
    description: 'Two-seat sofa, ground floor to ground floor.',
    location: 'Sai Ying Pun',
    priceLabel: '£120',
    badgeText: 'Moving',
    timingLabel: 'Tomorrow',
  },
]

const meta = {
  title: 'user/ui/PublicUserOpenTasks',
  component: PublicUserOpenTasks,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    heading: 'Open tasks',
    countLabel: '2 open tasks',
    emptyLabel: 'No open tasks right now.',
    viewTaskLabel: 'View {title}',
    tasks,
  },
} satisfies Meta<typeof PublicUserOpenTasks>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { tasks: [], countLabel: '0 open tasks' },
}

export const Loading: Story = {
  args: { pending: true, tasks: [] },
}

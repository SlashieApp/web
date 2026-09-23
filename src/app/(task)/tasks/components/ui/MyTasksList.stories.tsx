import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { MyTaskHubSection } from '../../helpers/myTasksHub'
import { MyTasksList } from './MyTasksList'

const sections: MyTaskHubSection[] = [
  {
    id: 'open',
    rows: [
      {
        id: 'overdue',
        title: 'Fix a leaking kitchen tap',
        description: 'Tap drips into the cabinet.',
        location: 'Mong Kok',
        priceLabel: '£80',
        categoryLabel: 'Handyman',
        roles: ['hosted'],
        section: 'open',
        timing: { kind: 'overdue' },
        quoteCount: 3,
        acceptedWorkerName: null,
      },
      {
        id: 'dual',
        title: 'Move two boxes across the harbour',
        description: '',
        location: 'Wan Chai',
        priceLabel: '£120',
        categoryLabel: 'Moving',
        roles: ['hosted', 'quoted'],
        section: 'open',
        timing: { kind: 'tomorrow' },
        quoteCount: 1,
        acceptedWorkerName: null,
      },
      {
        id: 'quoted',
        title: 'Assemble a standing desk',
        description: '',
        location: 'Central',
        priceLabel: '£60',
        categoryLabel: 'Handyman',
        roles: ['quoted'],
        section: 'open',
        timing: { kind: 'flexible' },
        quoteCount: 0,
        acceptedWorkerName: null,
      },
    ],
  },
  {
    id: 'booked',
    rows: [
      {
        id: 'booked',
        title: 'Weekend dog walk',
        description: '',
        location: 'Victoria Park',
        priceLabel: '£40',
        categoryLabel: 'General / other',
        roles: ['hosted'],
        section: 'booked',
        timing: { kind: 'today' },
        quoteCount: 2,
        acceptedWorkerName: 'Alex',
      },
    ],
  },
  {
    id: 'completed',
    rows: [
      {
        id: 'done',
        title: 'Deep-clean a studio',
        description: '',
        location: 'Sai Ying Pun',
        priceLabel: '£150',
        categoryLabel: 'Cleaning',
        roles: ['quoted'],
        section: 'completed',
        timing: { kind: 'scheduled', at: '2026-09-12T09:00:00.000Z' },
        quoteCount: 0,
        acceptedWorkerName: null,
      },
    ],
  },
]

const meta = {
  title: 'task/tasks/ui/MyTasksList',
  component: MyTasksList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    sections,
    onOpen: () => undefined,
  },
} satisfies Meta<typeof MyTasksList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: { sections: [], loading: true },
}

export const Empty: Story = {
  args: { sections: [] },
}

export const LoadError: Story = {
  args: {
    sections: [],
    errorMessage: 'Could not load your tasks.',
    onRetry: () => undefined,
  },
}

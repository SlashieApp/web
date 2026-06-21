import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Avatar } from './Avatar'

const taskOwnerSrc =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop'
const workerSrc =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop'

const meta = {
  title: 'ui/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const TaskCardOwner: Story = {
  render: () => (
    <Avatar name="Alex Morgan" label="Alex Morgan" src={taskOwnerSrc} />
  ),
}

export const QuoteListWorker: Story = {
  render: () => <Avatar name="Jordan Lee" label="Jordan Lee" src={workerSrc} />,
}

export const InitialsFallback: Story = {
  render: () => <Avatar name="Sam Taylor" label="Sam Taylor" />,
}

export const WorkerRow: Story = {
  render: () => (
    <HStack gap={3}>
      <Avatar name="Alex Morgan" label="Alex Morgan" />
      <Avatar name="Jordan Lee" label="Jordan Lee" />
      <Avatar name="Sam Taylor" label="Sam Taylor" />
    </HStack>
  ),
}

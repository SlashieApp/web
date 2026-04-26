import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Avatar } from './Avatar'

const meta = {
  title: 'ui/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    name: 'Alex Morgan',
    label: 'Alex Morgan',
    src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop',
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ImageOnly: Story = {
  args: {
    label: undefined,
  },
}

export const Placeholder: Story = {
  args: {
    src: undefined,
  },
}

export const Row: Story = {
  render: () => (
    <HStack gap={4}>
      <Avatar
        name="Alex Morgan"
        label="Alex Morgan"
        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=128&h=128&fit=crop"
      />
      <Avatar
        name="Jordan Lee"
        label="Jordan Lee"
        src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop"
      />
    </HStack>
  ),
}

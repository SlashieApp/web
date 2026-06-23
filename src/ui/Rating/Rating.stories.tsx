import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Rating } from './Rating'

const meta = {
  title: 'ui/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    value: '4.9',
  },
} satisfies Meta<typeof Rating>

export default meta

type Story = StoryObj<typeof meta>

export const TaskCardWorker: Story = {
  args: { value: '4.9' },
  render: (args) => <Rating {...args} />,
}

export const NoReviewsYet: Story = {
  args: { value: '—' },
  render: (args) => <Rating {...args} />,
}

export const ProfileComparison: Story = {
  args: { value: '5.0' },
  render: () => (
    <HStack gap={4}>
      <Rating value="5.0" />
      <Rating value="4.2" />
    </HStack>
  ),
}

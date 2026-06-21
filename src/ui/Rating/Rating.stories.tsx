import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Rating } from './Rating'

const meta = {
  title: 'ui/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Rating>

export default meta

type Story = StoryObj<typeof meta>

export const TaskCardWorker: Story = {
  render: () => <Rating value="4.9" />,
}

export const NoReviewsYet: Story = {
  render: () => <Rating value="—" />,
}

export const ProfileComparison: Story = {
  render: () => (
    <HStack gap={4}>
      <Rating value="5.0" />
      <Rating value="4.2" />
    </HStack>
  ),
}

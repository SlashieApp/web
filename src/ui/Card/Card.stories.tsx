import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Card } from './Card'

const meta = {
  title: 'ui/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    isActive: false,
    activeBorderColor: 'secondary',
  },
  argTypes: {
    isActive: { control: 'boolean' },
    activeBorderColor: { control: 'text' },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <Text fontSize="md" color="cardFg">
        Generic card wrapper. Pass any content via children.
      </Text>
    </Card>
  ),
}

import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HandyBoxWordmark } from './HandyBoxWordmark'

const meta = {
  title: 'ui/HandyBoxWordmark',
  component: HandyBoxWordmark,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HandyBoxWordmark>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <Stack gap={6} align="flex-start">
      <HandyBoxWordmark size="md" />
      <HandyBoxWordmark size="lg" />
    </Stack>
  ),
}

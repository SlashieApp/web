import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuMessageSquare } from 'react-icons/lu'

import { CountChip } from './CountChip'

const meta = {
  title: 'Components/CountChip',
  component: CountChip,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    icon: <LuMessageSquare />,
    children: '0 quotes so far',
  },
} satisfies Meta<typeof CountChip>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Examples: Story = {
  render: () => (
    <HStack gap={3} flexWrap="wrap">
      <CountChip icon={<LuMessageSquare />}>0 quotes so far</CountChip>
      <CountChip icon={<LuMessageSquare />}>3 quotes so far</CountChip>
      <CountChip>128 views</CountChip>
    </HStack>
  ),
}

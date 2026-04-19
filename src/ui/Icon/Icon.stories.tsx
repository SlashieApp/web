import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuCalendar } from 'react-icons/lu'

import { Icon } from './Icon'

const meta = {
  title: 'ui/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    color: 'tertiary' as const,
    boxSize: '24px',
    children: <LuCalendar size={20} strokeWidth={2} aria-hidden />,
  },
} satisfies Meta<typeof Icon>

export default meta

type Story = StoryObj<typeof meta>

export const Tertiary: Story = {
  args: {
    color: 'tertiary',
    boxSize: '24px',
    children: <LuCalendar size={20} strokeWidth={2} aria-hidden />,
  },
}

export const Primary: Story = {
  args: {
    color: 'primary',
    boxSize: '24px',
    children: <LuCalendar size={20} strokeWidth={2} aria-hidden />,
  },
}

export const Danger: Story = {
  args: {
    color: 'danger',
    boxSize: '24px',
    children: <LuCalendar size={20} strokeWidth={2} aria-hidden />,
  },
}

export const Row: Story = {
  render: () => (
    <HStack gap={6} bg="bg" p={6} borderRadius="lg">
      <Icon color="primary" boxSize="24px">
        <LuCalendar size={20} strokeWidth={2} aria-hidden />
      </Icon>
      <Icon color="tertiary" boxSize="24px">
        <LuCalendar size={20} strokeWidth={2} aria-hidden />
      </Icon>
      <Icon color="danger" boxSize="24px">
        <LuCalendar size={20} strokeWidth={2} aria-hidden />
      </Icon>
    </HStack>
  ),
}

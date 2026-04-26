import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Rating } from './Rating'

const meta = {
  title: 'ui/Rating',
  component: Rating,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    value: '4.9',
  },
} satisfies Meta<typeof Rating>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

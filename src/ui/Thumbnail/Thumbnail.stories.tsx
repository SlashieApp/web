import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Thumbnail } from './Thumbnail'

const meta = {
  title: 'ui/Thumbnail',
  component: Thumbnail,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    alt: 'Task thumbnail',
    src: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=600&fit=crop',
  },
} satisfies Meta<typeof Thumbnail>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    src: undefined,
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BrandLoading } from './BrandLoading'

const meta = {
  title: 'ui/BrandLoading',
  component: BrandLoading,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    label: 'Just a moment…',
    trackLabel: 'Loading',
    minH: '100dvh',
  },
} satisfies Meta<typeof BrandLoading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Compact: Story = {
  args: {
    minH: '50vh',
    label: 'Loading your profile…',
  },
}

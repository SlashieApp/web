import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BrandLoading } from './BrandLoading'

const meta = {
  title: 'UI/BrandLoading',
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

/** Full-screen wait: wordmark, indeterminate bar and a caption. */
export const Default: Story = {}

/** Compact: fills half the viewport, for waits inside a page section. */
export const Compact: Story = {
  args: {
    minH: '50vh',
    label: 'Loading your profile…',
  },
}

/** Silent wait: no caption, only the wordmark and the bar. */
export const NoLabel: Story = {
  args: { label: undefined },
}

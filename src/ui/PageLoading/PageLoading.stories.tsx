import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PageLoading } from './PageLoading'

const meta = {
  title: 'ui/PageLoading',
  component: PageLoading,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {},
} satisfies Meta<typeof PageLoading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

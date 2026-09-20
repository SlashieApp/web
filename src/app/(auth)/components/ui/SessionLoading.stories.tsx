import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SessionLoading } from './SessionLoading'

const meta: Meta<typeof SessionLoading> = {
  title: 'auth/ui/SessionLoading',
  component: SessionLoading,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TrustCard } from './TrustCard'

const meta: Meta<typeof TrustCard> = {
  title: 'task/tasks/ui/openTask/TrustCard',
  component: TrustCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

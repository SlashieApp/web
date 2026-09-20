import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { NextStepCard } from './ProfileSidebarCards'

const meta: Meta<typeof NextStepCard> = {
  title: 'dashboard/profile/ui/cards/ProfileSidebarCards',
  component: NextStepCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

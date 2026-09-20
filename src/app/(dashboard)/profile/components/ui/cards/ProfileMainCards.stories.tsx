import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PersonalInfoCard } from './ProfileMainCards'

const meta: Meta<typeof PersonalInfoCard> = {
  title: 'dashboard/profile/ui/cards/ProfileMainCards',
  component: PersonalInfoCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

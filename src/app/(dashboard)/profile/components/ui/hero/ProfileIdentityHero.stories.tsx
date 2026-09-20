import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ProfileIdentityHero } from './ProfileIdentityHero'

const meta: Meta<typeof ProfileIdentityHero> = {
  title: 'dashboard/profile/ui/hero/ProfileIdentityHero',
  component: ProfileIdentityHero,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

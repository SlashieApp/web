import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MeAvatar } from './MeAvatar'

const meta: Meta<typeof MeAvatar> = {
  title: 'auth/ui/MeAvatar',
  component: MeAvatar,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { GoogleAuthButton } from './GoogleAuthButton'

const meta: Meta<typeof GoogleAuthButton> = {
  title: 'auth/ui/GoogleAuthButton',
  component: GoogleAuthButton,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

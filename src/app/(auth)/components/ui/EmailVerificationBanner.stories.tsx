import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { EmailVerificationBanner } from './EmailVerificationBanner'

const meta: Meta<typeof EmailVerificationBanner> = {
  title: 'auth/ui/EmailVerificationBanner',
  component: EmailVerificationBanner,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

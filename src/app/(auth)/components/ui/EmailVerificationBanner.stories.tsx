import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { EmailVerificationBanner } from './EmailVerificationBanner'

const meta: Meta<typeof EmailVerificationBanner> = {
  title: 'Auth/EmailVerificationBanner',
  component: EmailVerificationBanner,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

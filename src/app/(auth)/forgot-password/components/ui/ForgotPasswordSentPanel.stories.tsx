import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ForgotPasswordSentPanel } from './ForgotPasswordSentPanel'

const meta: Meta<typeof ForgotPasswordSentPanel> = {
  title: 'auth/forgot-password/ui/ForgotPasswordSentPanel',
  component: ForgotPasswordSentPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

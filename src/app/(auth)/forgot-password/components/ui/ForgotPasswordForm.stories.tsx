import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ForgotPasswordForm } from './ForgotPasswordForm'

const meta: Meta<typeof ForgotPasswordForm> = {
  title: 'auth/forgot-password/ui/ForgotPasswordForm',
  component: ForgotPasswordForm,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

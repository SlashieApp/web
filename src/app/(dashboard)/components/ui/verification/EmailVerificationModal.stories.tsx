import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { EmailVerificationModal } from './EmailVerificationModal'

const meta: Meta<typeof EmailVerificationModal> = {
  title: 'Dashboard/Shared/EmailVerificationModal',
  component: EmailVerificationModal,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

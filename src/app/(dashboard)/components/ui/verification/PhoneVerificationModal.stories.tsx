import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PhoneVerificationModal } from './PhoneVerificationModal'

const meta: Meta<typeof PhoneVerificationModal> = {
  title: 'dashboard/ui/verification/PhoneVerificationModal',
  component: PhoneVerificationModal,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

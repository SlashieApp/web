import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FieldIconMail } from './ForgotPasswordIcons'

const meta: Meta<typeof FieldIconMail> = {
  title: 'Auth/ForgotPasswordIcons',
  component: FieldIconMail,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

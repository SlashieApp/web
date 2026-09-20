import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TurnstileField } from './TurnstileField'

const meta: Meta<typeof TurnstileField> = {
  title: 'auth/ui/TurnstileField',
  component: TurnstileField,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

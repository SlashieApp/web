import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { within } from 'storybook/test'

import { AuthDivider } from './AuthDivider'

/** Between Google / Apple and the email form. */
const meta = {
  title: 'Auth/Parts/AuthDivider',
  component: AuthDivider,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AuthDivider>

export default meta
type Story = StoryObj<typeof meta>

/** The rule with its label. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Or continue with email')
  },
}

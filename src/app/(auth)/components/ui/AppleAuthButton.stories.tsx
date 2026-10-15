import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AppleSignInButton } from './AppleAuthButton'

const meta: Meta<typeof AppleSignInButton> = {
  title: 'Auth/AppleAuthButton',
  component: AppleSignInButton,
  parameters: { layout: 'padded' },
  args: { label: 'Continue with Apple', onClick: () => {} },
}

export default meta
type Story = StoryObj<typeof meta>

/** The live button renders this once Apple's script is ready. */
export const Default: Story = {}

/** Before Apple's script loads, or while signing in. */
export const Disabled: Story = { args: { disabled: true } }

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AppleSignInButton } from './AppleAuthButton'

/** Apple's button, styled to match Google's outline widget beside it. */
const meta = {
  title: 'Auth/AppleAuthButton',
  component: AppleSignInButton,
  parameters: { layout: 'padded' },
  args: { label: 'Continue with Apple', onClick: () => {} },
} satisfies Meta<typeof AppleSignInButton>

export default meta
type Story = StoryObj<typeof meta>

/** Ready: the live button renders this once Apple's script has loaded. */
export const Default: Story = {}

/** Disabled: before Apple's script loads, or while a sign-in is running. */
export const Disabled: Story = { args: { disabled: true } }

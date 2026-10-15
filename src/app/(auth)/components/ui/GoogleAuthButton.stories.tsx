import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withSession } from '../../helpers/authStoryDecorator'
import { GoogleAuthButton } from './GoogleAuthButton'

const meta = {
  title: 'Auth/GoogleAuthButton',
  component: GoogleAuthButton,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GoogleAuthButton>

export default meta
type Story = StoryObj<typeof meta>

/** Ready: Google's own button, sized to the container. */
export const Default: Story = {
  decorators: [withSession()],
}

/** Sign-up before the consent boxes are ticked: a press shows the prompt instead of signing in. */
export const Blocked: Story = {
  args: { blocked: true },
  decorators: [withSession()],
}

/** A sign-in is running: the button is dimmed and ignores presses. */
export const SigningIn: Story = {
  decorators: [withSession({ authLoading: true })],
}

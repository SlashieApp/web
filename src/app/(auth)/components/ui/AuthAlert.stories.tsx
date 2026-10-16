import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { AuthAlert } from './AuthAlert'

/** One line of feedback in an auth form, with an icon so colour isn't the only signal. */
const meta = {
  title: 'Auth/Parts/AuthAlert',
  component: AuthAlert,
  parameters: { layout: 'padded' },
  args: { children: 'Email or password is incorrect.' },
} satisfies Meta<typeof AuthAlert>

export default meta
type Story = StoryObj<typeof meta>

/** Something went wrong: announced at once. */
export const Danger: Story = {
  play: async ({ canvasElement }) => {
    expect(await within(canvasElement).findByRole('alert')).toHaveTextContent(
      'Email or password is incorrect.',
    )
  },
}

/** Done: a link was sent. */
export const Success: Story = {
  args: {
    tone: 'success',
    children: 'Verification email sent. Check your inbox.',
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('status')
  },
}

/** An account notice. */
export const Info: Story = {
  args: {
    tone: 'info',
    children:
      'Your account will be deleted on 12 November 2030. Sign in before then to restore it.',
  },
}

/** Long copy wraps beside the icon. */
export const LongText: Story = {
  args: {
    children:
      'Security check failed or expired. Complete it again and retry. If this keeps happening, try another browser or turn off extensions that block scripts.',
  },
}

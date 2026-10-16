import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'

import { ResetLinkMissing, ResetPasswordScreen } from './ResetPasswordScreen'

/** /reset-password: a new password from the emailed link. */
const meta = {
  title: 'Auth/Reset password/ResetPasswordScreen',
  component: ResetPasswordScreen,
  parameters: {
    layout: 'padded',
    nextjs: {
      navigation: { pathname: '/reset-password', query: { token: 'story' } },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResetPasswordScreen>

export default meta
type Story = StoryObj<typeof meta>

type Canvas = ReturnType<typeof within>

async function submit(canvas: Canvas, password: string, confirm = password) {
  await userEvent.type(canvas.getByLabelText('New password'), password)
  await userEvent.type(canvas.getByLabelText('Confirm new password'), confirm)
  await userEvent.click(canvas.getByRole('button', { name: 'Reset password' }))
}

/** From the email link: new password, with the rule as a hint. */
export const Default: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: 'Create a new password',
    })
    await canvas.findByText('At least 8 characters.')
  },
}

/** Phone width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession()],
}

/** Too short and not matching. */
export const ValidationErrors: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await submit(canvas, 'short', 'shorter')
    await canvas.findByText('Use at least 8 characters.')
    await canvas.findByText('Passwords do not match.')
  },
}

/** The link expired: a way to ask for a new one. */
export const LinkExpired: Story = {
  decorators: [
    withSession({
      responses: {
        ResetPassword: {
          kind: 'graphqlError',
          code: 'INVALID_OR_EXPIRED_RESET_TOKEN',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await submit(canvas, 'password1')
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'This reset link is invalid or has expired. Request a new one.',
    )
    await canvas.findByRole('link', { name: 'Request reset link' })
  },
}

/** The API can't be reached. */
export const NetworkError: Story = {
  decorators: [
    withSession({ responses: { ResetPassword: { kind: 'networkError' } } }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await submit(canvas, 'password1')
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      "Can't reach Slashie. Check your connection and try again.",
    )
  },
}

/** Opened without a token: ask for a new link. */
export const LinkMissing: Story = {
  render: () => <ResetLinkMissing />,
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: 'Reset link required',
    })
  },
}

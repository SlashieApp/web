import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { LoginPanel } from './LoginPanel'

/** The sign-in column for each login view, message and notice (`views/README.md`). */
const meta = {
  title: 'Auth/Login/LoginPanel',
  component: LoginPanel,
  parameters: { layout: 'padded' },
  args: {
    view: 'signIn',
    message: null,
    notice: null,
    retryInSeconds: 0,
    submitting: false,
    securitySolved: false,
    securityResetSignal: 0,
    onSecurityToken: fn(),
    next: null,
    registerHref: '/register',
    defaultValues: { email: '', password: '' },
    onSubmit: fn(),
  },
  decorators: [withAuthWidgets(), withSession()],
} satisfies Meta<typeof LoginPanel>

export default meta
type Story = StoryObj<typeof meta>

/** Signed out: Google, Apple and the email form, no eyebrow above the title. */
export const SignIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { level: 1, name: 'Log in to Slashie' })
    expect(canvas.queryByText('Account')).toBeNull()
  },
}

/** Phone width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

/** Submitted empty: the fields say what's missing. */
export const EmptySubmit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Log in' }))
    await canvas.findByText('Enter your email.')
    await canvas.findByText('Password is required.')
    expect(args.onSubmit).not.toHaveBeenCalled()
  },
}

/** Logging in: the button is busy. */
export const Submitting: Story = {
  args: {
    submitting: true,
    defaultValues: { email: 'sam@example.com', password: 'correct-horse' },
  },
}

/** Wrong email or password. */
export const InvalidCredentials: Story = {
  args: { message: 'invalidCredentials' },
  play: async ({ canvasElement }) => {
    expect(await within(canvasElement).findByRole('alert')).toHaveTextContent(
      'Email or password is incorrect.',
    )
  },
}

/** Third failed attempt: Log in waits for the security check. */
export const SecurityCheck: Story = {
  args: { view: 'securityCheck', message: 'invalidCredentials' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Security check placeholder')
    expect(canvas.getByRole('button', { name: 'Log in' })).toBeDisabled()
  },
}

/** The security check is solved: Log in is available again. */
export const SecurityCheckSolved: Story = {
  args: { view: 'securityCheck', securitySolved: true },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).getByRole('button', { name: 'Log in' }),
    ).toBeEnabled()
  },
}

/** The API asked for the security check before the third failure. */
export const SecurityCheckRequired: Story = {
  args: { view: 'securityCheck', message: 'securityCheckRequired' },
}

/** The security check failed or expired. */
export const SecurityCheckFailed: Story = {
  args: { view: 'securityCheck', message: 'securityCheckFailed' },
}

/** Too many attempts: the button counts down to the retry. */
export const RateLimited: Story = {
  args: { view: 'rateLimited', message: 'rateLimited', retryInSeconds: 42 },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).getByRole('button', { name: 'Try again in 42s' }),
    ).toBeDisabled()
  },
}

/** The API can't be reached. */
export const NetworkError: Story = {
  args: { message: 'networkError' },
  play: async ({ canvasElement }) => {
    expect(await within(canvasElement).findByRole('alert')).toHaveTextContent(
      "Can't reach Slashie. Check your connection and try again.",
    )
  },
}

/** Any other failure. */
export const Failed: Story = {
  args: { message: 'failed' },
}

/** After requesting deletion: the date it happens. */
export const DeletionScheduled: Story = {
  args: { notice: { kind: 'scheduled', date: '2030-11-12' } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'Your account will be deleted on 12 November 2030. Sign in before then to restore it.',
    )
  },
}

/** Deletion link without a usable date. */
export const DeletionScheduledNoDate: Story = {
  args: { notice: { kind: 'scheduled', date: null } },
}

/** From the deletion emails: sign in to restore. */
export const RestoreAccount: Story = {
  args: { notice: { kind: 'restore' } },
}

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  args: { message: 'networkError' },
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/login' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: '登入 Slashie',
    })
  },
}

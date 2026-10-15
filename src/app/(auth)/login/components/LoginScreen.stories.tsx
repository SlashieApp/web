import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { LoginScreen } from './LoginScreen'

/** The whole /login screen: the session check, then the brand panel and sign-in column. */
const meta = {
  title: 'Auth/Login/LoginScreen',
  component: LoginScreen,
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/login' } },
  },
  args: { hasSession: false },
} satisfies Meta<typeof LoginScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Signed out on desktop: brand panel and sign-in column. */
export const SignedOut: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: 'Log in to Slashie',
    })
  },
}

/** Signed out on a phone: the sign-in column alone. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withAuthWidgets(), withSession()],
}

/** A saved session is being checked: the splash, never the form. */
export const CheckingSession: Story = {
  args: { hasSession: true },
  decorators: [withSession({ token: true, authLoading: true })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Just a moment…')
    expect(canvas.queryByRole('heading', { level: 1 })).toBeNull()
  },
}

/** Already signed in: the splash stays while they're sent on to `next`. */
export const AlreadySignedIn: Story = {
  args: { hasSession: true },
  parameters: {
    nextjs: {
      navigation: { pathname: '/login', query: { next: '/tasks/create' } },
    },
  },
  decorators: [withSession({ token: true, me: storyMe() })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Just a moment…')
  },
}

/** The saved session had expired: back to the sign-in form. */
export const SessionExpired: Story = {
  args: { hasSession: true },
  decorators: [withAuthWidgets(), withSession({ token: true })],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', {
      level: 1,
      name: 'Log in to Slashie',
    })
  },
}

/** Opened from the deletion emails: the restore notice above the sign-in options. */
export const RestoreLink: Story = {
  parameters: {
    nextjs: { navigation: { pathname: '/login', query: { restore: '1' } } },
  },
  decorators: [withAuthWidgets(), withSession()],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      "Sign in to restore your account. You'll be asked to confirm.",
    )
  },
}

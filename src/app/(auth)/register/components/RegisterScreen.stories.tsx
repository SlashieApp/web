import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  type StorySessionOptions,
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'

import { RegisterScreen } from './RegisterScreen'

/** /register: consent first (it gates every way in), then Google, Apple and email. */
const meta = {
  title: 'Auth/Register/RegisterScreen',
  component: RegisterScreen,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/register' } },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegisterScreen>

export default meta
type Story = StoryObj<typeof meta>

const decorate = (session: StorySessionOptions = {}) => [
  withAuthWidgets(),
  withSession(session),
]

type Canvas = ReturnType<typeof within>

async function fillForm(canvas: Canvas) {
  await userEvent.click(canvas.getByText('I confirm I am 18 or over.'))
  await userEvent.click(canvas.getByText(/I agree to the/))
  await userEvent.type(canvas.getByLabelText('Full name'), 'Alex Chen')
  await userEvent.type(canvas.getByLabelText('Email'), 'alex@example.com')
  await userEvent.type(canvas.getByLabelText('Password'), 'password1')
  await userEvent.type(canvas.getByLabelText('Confirm password'), 'password1')
  await userEvent.click(canvas.getByRole('button', { name: 'Create account' }))
}

/** Nothing ticked yet: the consent hint shows under Google and Apple. */
export const Default: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      level: 1,
      name: 'Create your account',
    })
    await canvas.findByText(
      'Confirm you are 18 or over and agree to the Terms before continuing with Google or Apple.',
    )
  },
}

/** Phone width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: decorate(),
}

/** Submitted empty: every field and both required boxes say what's missing. */
export const EmptySubmit: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Create account' }),
    )
    await canvas.findByText('Enter your full name.')
    await canvas.findByText('Enter your email.')
    await canvas.findByText('Use at least 8 characters.')
    await canvas.findByText(
      'You must confirm you are 18 or over to use Slashie.',
    )
    await canvas.findByText(
      'Please agree to the Terms of Service and Privacy Policy.',
    )
  },
}

/** Both required boxes ticked: the consent hint goes and Google / Apple open. */
export const ConsentGiven: Story = {
  decorators: decorate(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('I confirm I am 18 or over.'))
    await userEvent.click(canvas.getByText(/I agree to the/))
    expect(
      canvas.queryByText(/before continuing with Google or Apple/),
    ).toBeNull()
  },
}

/** The email already has an account. */
export const EmailTaken: Story = {
  decorators: decorate({
    responses: {
      Register: { kind: 'graphqlError', code: 'EMAIL_ALREADY_REGISTERED' },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillForm(canvas)
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists. Log in instead.',
    )
  },
}

/** Too many sign-ups from this address. */
export const RateLimited: Story = {
  decorators: decorate({
    responses: {
      Register: { kind: 'graphqlError', code: 'REGISTER_RATE_LIMITED' },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillForm(canvas)
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Too many attempts right now. Please wait a bit and try again.',
    )
  },
}

/** The API can't be reached. */
export const NetworkError: Story = {
  decorators: decorate({
    responses: { Register: { kind: 'networkError' } },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await fillForm(canvas)
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      "Can't reach Slashie. Check your connection and try again.",
    )
  },
}

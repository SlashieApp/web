import { LoginMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { isAppleAuthConfigured } from '@/app/(auth)/helpers/appleAuthConfig'
import {
  type StoryResponse,
  withAuthWidgets,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import {
  LinkLoginMethodDialog,
  UnlinkLoginMethodDialog,
} from './LoginMethodDialogs'

const me = storyMe({
  enabledLoginMethods: [LoginMethod.Google, LoginMethod.Apple],
  googleLoginEmail: 'sam.personal@gmail.com',
  appleLoginEmail: 'x7k2p9@privaterelay.appleid.com',
})

/** A story-only session whose API answers `UnlinkLoginMethod` as given. */
const api = (response?: StoryResponse) =>
  withSession({
    me,
    responses: response ? { UnlinkLoginMethod: response } : undefined,
  })

const meta = {
  title: 'Dashboard/Account/LoginMethodDialogs',
  component: LinkLoginMethodDialog,
  args: {
    method: LoginMethod.Google,
    onClose: fn(),
    email: 'sam.carter@example.com',
  },
  decorators: [withAuthWidgets()],
} satisfies Meta<typeof LinkLoginMethodDialog>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Link Google: Google's button hands over a token; the account email stays. */
export const LinkGoogle: Story = {
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', { name: 'Link Google' }),
    ).toBeInTheDocument()
    await expect(
      page(canvasElement).getByText(/stays sam.carter@example.com/),
    ).toBeInTheDocument()
  },
}

/** Link Apple: Apple's button, the same promise about the account email. */
export const LinkApple: Story = {
  args: { method: LoginMethod.Apple },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', { name: 'Link Apple' }),
    ).toBeInTheDocument()
    // Apple's button only renders when a Services ID is configured.
    if (!isAppleAuthConfigured()) return
    await expect(
      page(canvasElement).getByRole('button', { name: 'Continue with Apple' }),
    ).toBeInTheDocument()
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { method: null },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    await expect(page(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/** Unlink Google: a confirm before the sign-in goes. */
export const UnlinkConfirm: Story = {
  decorators: [api()],
  render: ({ method, onClose }) => (
    <UnlinkLoginMethodDialog method={method} onClose={onClose} />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      await page(canvasElement).findByRole('dialog', {
        name: 'Unlink Google?',
      }),
    ).toBeInTheDocument()
  },
}

/** The last way in: the API refuses, and the copy says to set a password first. */
export const UnlinkLastMethod: Story = {
  decorators: [api({ kind: 'graphqlError', code: 'LAST_LOGIN_METHOD' })],
  render: ({ method, onClose }) => (
    <UnlinkLoginMethodDialog method={method} onClose={onClose} />
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Unlink' }),
    )
    await expect(
      await page(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Set a password or keep your other sign-in')
  },
}

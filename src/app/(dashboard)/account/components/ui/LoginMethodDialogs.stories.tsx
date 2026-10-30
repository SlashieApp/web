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
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import {
  barButton,
  bodyColumn,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  openDialog,
  phone390,
} from '../../../components/ui/dialogSpacing.testing'
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

/**
 * Link Google: the sentence is the description (8 under the title). The
 * provider's button is the main action: 24 under the description, 48 tall, and
 * 20 above the Cancel bar. Only the provider being linked shows, so there is no
 * divider and nothing under the button.
 */
async function expectLinkSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'Link Google',
  )
  const button = bodyColumn(body).firstElementChild as HTMLElement

  await expect(dialog).toHaveAccessibleDescription(
    /Choose the Google account you want to sign in with/,
  )
  await expect(gapBelow(title, description as HTMLElement)).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(description as HTMLElement, button)).toBe(
    formSpace.headerToBody,
  )
  await expect(heightOf(button)).toBe(formSpace.controlHeight)
  await expect(gapBelow(button, barButton(dialog, 'Cancel'))).toBe(
    formSpace.bodyToAction,
  )
  await expect(bodyColumn(body).children).toHaveLength(1)
  expectNoHorizontalOverflow(body)
}

/** Link Google: description 8, the button 24 below it, 48 tall, 20 above Cancel. */
export const LinkSpacing: Story = {
  decorators: [api()],
  play: ({ canvasElement }) => expectLinkSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const LinkSpacingPhone: Story = {
  ...phone390,
  decorators: [api()],
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectLinkSpacing(canvasElement)
  },
}

/** Link Apple: the same, with Apple's button (when a Services ID is set). */
export const LinkAppleSpacing: Story = {
  args: { method: LoginMethod.Apple },
  decorators: [api()],
  play: async ({ canvasElement }) => {
    const { dialog, title, description, body } = await openDialog(
      canvasElement,
      'Link Apple',
    )
    await expect(gapBelow(title, description as HTMLElement)).toBe(
      formSpace.titleToSubtitle,
    )
    if (!isAppleAuthConfigured()) return
    const button = within(dialog).getByRole('button', {
      name: 'Continue with Apple',
    })
    await expect(gapBelow(description as HTMLElement, button)).toBe(
      formSpace.headerToBody,
    )
    await expect(heightOf(button)).toBe(formSpace.controlHeight)
    await expect(gapBelow(button, barButton(dialog, 'Cancel'))).toBe(
      formSpace.bodyToAction,
    )
    expectNoHorizontalOverflow(body)
  },
}

/**
 * Unlink: a confirm with no field, so the sentence is the description: 8 under
 * the title, what the dialog is described by (focus opens on Close, so it is
 * read first), and the buttons are 24 under it, the header's step to the next
 * block. The body has nothing in it.
 */
export const UnlinkSpacing: Story = {
  decorators: [api()],
  render: ({ method, onClose }) => (
    <UnlinkLoginMethodDialog method={method} onClose={onClose} />
  ),
  play: async ({ canvasElement }) => {
    const { dialog, title, description, body } = await openDialog(
      canvasElement,
      'Unlink Google?',
    )
    await expect(description).not.toBeNull()
    const sentence = description as HTMLElement

    await expect(sentence).toHaveTextContent(
      /You won't be able to sign in with Google any more/,
    )
    await expect(dialog).toHaveAccessibleDescription(
      /You won't be able to sign in with Google any more/,
    )
    await expect(body.children).toHaveLength(0)
    await expect(gapBelow(title, sentence)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(sentence, barButton(dialog, 'Unlink'))).toBe(
      formSpace.headerToBody,
    )
  },
}

/** An error from the API is the body: 24 under the description, 20 above the buttons. */
export const UnlinkErrorSpacing: Story = {
  decorators: [api({ kind: 'graphqlError', code: 'LAST_LOGIN_METHOD' })],
  render: ({ method, onClose }) => (
    <UnlinkLoginMethodDialog method={method} onClose={onClose} />
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await page(canvasElement).findByRole('button', { name: 'Unlink' }),
    )
    const { dialog } = await openDialog(canvasElement, 'Unlink Google?')
    const alert = await within(dialog).findByRole('alert')
    const sentence = within(dialog).getByText(
      /You won't be able to sign in with Google any more/,
    )

    await expect(gapBelow(sentence, alert)).toBe(formSpace.headerToBody)
    await expect(gapBelow(alert, barButton(dialog, 'Unlink'))).toBe(
      formSpace.bodyToAction,
    )
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  LuCircleCheck,
  LuLink2Off,
  LuMailCheck,
  LuTriangleAlert,
} from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import { cardParts } from '@/app/(auth)/helpers/authSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'
import { Button, FormAlternatives, FormStack, Link } from '@ui'

import { AuthAlert } from './AuthAlert'
import { AuthCard } from './AuthCard'

/** The body of every auth page: a card on desktop, flush on phones and tablets. */
const meta = {
  title: 'Auth/Parts/AuthCard',
  component: AuthCard,
  parameters: { layout: 'padded' },
  args: {
    title: 'Reset your password',
    description: "Enter your email and we'll send you a secure link.",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 448 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthCard>

export default meta
type Story = StoryObj<typeof meta>

/** A form page: title, description, content, and the link row underneath. */
export const Form: Story = {
  globals: { viewport: { value: 'desktop' } },
  args: {
    children: <Button w="full">Send reset link</Button>,
    footer: <Link href="/login">Back to log in</Link>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = await canvas.findByRole('heading', {
      level: 1,
      name: 'Reset your password',
    })
    // The header is the shared one: title 8 subtitle, then 24 to the form.
    const subtitle = canvas.getByText(
      "Enter your email and we'll send you a secure link.",
    )
    const button = canvas.getByRole('button', { name: 'Send reset link' })
    await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(subtitle, button)).toBe(formSpace.headerToBody)
  },
}

/** A notice above the form (deletion scheduled, restore): 24 under the header, 20 above the form. */
export const WithNotice: Story = {
  args: {
    notice: (
      <AuthAlert tone="info">
        Sign in to restore your account. You'll be asked to confirm.
      </AuthAlert>
    ),
    children: <Button w="full">Log in</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { subtitle } = await cardParts(canvas)
    const notice = canvas.getByRole('status')
    const button = canvas.getByRole('button', { name: 'Log in' })
    await expect(gapBelow(subtitle, notice)).toBe(formSpace.headerToBody)
    await expect(gapBelow(notice, button)).toBe(formSpace.fieldGap)
  },
}

/** A status page (sent, done): icon on top, everything centred. */
export const Status: Story = {
  args: {
    icon: LuMailCheck,
    title: 'Check your email',
    description: 'We sent a link to sam@example.com. It expires in 1 hour.',
    children: (
      <Button variant="secondary" w="full">
        Resend reset link
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('svg')?.parentElement
    if (!icon) throw new Error('No status icon')
    // The default status icon sits on the neutral tile, not a mint wash.
    await expect(getComputedStyle(icon).backgroundColor).toBe(
      'rgb(244, 244, 245)',
    )
    // Icon 24 above the title, title 8 above the description, then 24 to the button.
    const canvas = within(canvasElement)
    const parts = await cardParts(canvas)
    const button = canvas.getByRole('button', { name: 'Resend reset link' })
    await expect(parts.icon).toBe(icon)
    await expect(gapBelow(icon, parts.title)).toBe(formSpace.headerToBody)
    await expect(gapBelow(parts.title, parts.subtitle)).toBe(
      formSpace.titleToSubtitle,
    )
    await expect(gapBelow(parts.subtitle, button)).toBe(formSpace.headerToBody)
  },
}

/**
 * A status page with an alert and two buttons (Continue and Resend): header 24,
 * then the alert, 20, then the buttons, 8 apart. The same recipe as the verify
 * email page.
 */
export const StatusWithAlertAndButtons: Story = {
  args: {
    icon: LuMailCheck,
    title: 'Check your inbox',
    description: 'We sent a link to sam@example.com.',
    children: (
      <FormStack>
        <AuthAlert tone="success">Verification email sent.</AuthAlert>
        <FormAlternatives>
          <Button w="full" size="form">
            Continue
          </Button>
          <Button variant="secondary" w="full" size="form">
            Resend
          </Button>
        </FormAlternatives>
      </FormStack>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { subtitle } = await cardParts(canvas)
    const alert = canvas.getByRole('status')
    const next = canvas.getByRole('button', { name: 'Continue' })
    const resend = canvas.getByRole('button', { name: 'Resend' })
    await expect(gapBelow(subtitle, alert)).toBe(formSpace.headerToBody)
    await expect(gapBelow(alert, next)).toBe(formSpace.fieldGap)
    await expect(gapBelow(next, resend)).toBe(formSpace.alternativesGap)
    await expect(heightOf(next)).toBe(formSpace.controlHeight)
    await expect(heightOf(resend)).toBe(formSpace.controlHeight)
  },
}

/** A success status (email verified): the one status icon that is green. */
export const StatusSuccess: Story = {
  args: {
    icon: LuCircleCheck,
    tone: 'success',
    title: 'Email verified',
    description: 'You can now post tasks and send quotes.',
  },
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('svg')?.parentElement
    if (!icon) throw new Error('No status icon')
    // Neutral is the default tone; success alone carries the green tint.
    await expect(getComputedStyle(icon).backgroundColor).toBe(
      'rgb(231, 251, 240)',
    )
    // Nothing under the header: it gives no 24 of its own, so the card ends
    // at the description.
    const parts = await cardParts(within(canvasElement))
    await expect(parts.below).toHaveLength(0)
    await expect(
      parts.column.getBoundingClientRect().bottom -
        parts.header.getBoundingClientRect().bottom,
    ).toBeCloseTo(0, 2)
  },
}

/** A warning status (missing or invalid link). */
export const StatusWarning: Story = {
  args: {
    icon: LuLink2Off,
    tone: 'warning',
    title: 'Reset link required',
    description: 'Open the link from your email, or request a new one.',
    children: <Button w="full">Request reset link</Button>,
  },
}

/** A danger status (expired or failed). */
export const StatusDanger: Story = {
  args: {
    icon: LuTriangleAlert,
    tone: 'danger',
    title: 'Link expired or invalid',
    description: 'This verification link is invalid or has expired.',
  },
}

/** Phones: no card frame, the column is the page. */
export const Phone: Story = {
  ...Form,
  globals: { viewport: { value: 'mobile1' } },
}

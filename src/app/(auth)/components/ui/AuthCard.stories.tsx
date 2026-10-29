import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  LuCircleCheck,
  LuLink2Off,
  LuMailCheck,
  LuTriangleAlert,
} from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'
import { Button, Link } from '@ui'

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

/** A notice above the form (deletion scheduled, restore). */
export const WithNotice: Story = {
  args: {
    notice: (
      <AuthAlert tone="info">
        Sign in to restore your account. You'll be asked to confirm.
      </AuthAlert>
    ),
    children: <Button w="full">Log in</Button>,
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

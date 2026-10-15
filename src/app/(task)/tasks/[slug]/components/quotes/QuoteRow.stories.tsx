import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { QuoteRow } from './QuoteRow'

/** A small inline avatar, so the story never loads an image over the network. */
const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#7aa17a"/><circle cx="40" cy="32" r="14" fill="#fff"/><rect x="16" y="52" width="48" height="28" rx="14" fill="#fff"/></svg>',
)}`

/** One quote as a list row: who, when, price, message and the owner's actions. */
const meta = {
  title: 'Task detail/Quotes/QuoteRow',
  component: QuoteRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    name: 'Jordan Lee',
    avatarLabel: 'JL',
    priceLabel: '£85',
    message: 'I can do this Saturday morning with my own tools.',
    availabilityLabel: 'Sat 14 Jun, 09:00',
    respondedLabel: 'Responded 2 hours ago',
    withDivider: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteRow>

export default meta
type Story = StoryObj<typeof meta>

/** Read-only row (how a worker sees the other quotes): initials, price, message. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Jordan Lee')
    await canvas.findByText('£85')
    expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** Owner with a pending quote: Message, Decline and Accept. */
export const OwnerActions: Story = {
  args: {
    onAccept: fn(),
    onDecline: fn(),
    messageHref: '/messages',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Message' })
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Decline' }),
    )
    await expect(args.onDecline).toHaveBeenCalledOnce()
    await userEvent.click(canvas.getByRole('button', { name: 'Accept' }))
    await expect(args.onAccept).toHaveBeenCalledOnce()
  },
}

/** The cheapest recent quote among several: a "Best match" badge. */
export const BestMatch: Story = {
  args: { isBestMatch: true, onAccept: fn(), onDecline: fn() },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Best match')
  },
}

/** Identity-verified worker: a check mark beside the name. */
export const Verified: Story = {
  args: { showVerified: true },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByLabelText('Identity verified')
  },
}

/** The worker's photo instead of initials. */
export const WithPhoto: Story = {
  args: { avatarUrl: PHOTO },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('img', { name: 'Jordan Lee avatar' })
  },
}

/** A photo that fails to load falls back to the initials. */
export const BrokenPhoto: Story = {
  args: { avatarUrl: '/this-photo-does-not-exist.png' },
  play: async ({ canvasElement }) => {
    // The 404 has to come back before the initials replace the image.
    await within(canvasElement).findByText('JL', {}, { timeout: 5000 })
  },
}

/** Name and photo link to the worker's profile. */
export const ProfileLink: Story = {
  args: { workerProfileHref: '/workers/worker-detail-1' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Jordan Lee' })
    await canvas.findByRole('link', { name: 'View profile for Jordan Lee' })
  },
}

/** Accepted: the badge replaces the actions. */
export const Accepted: Story = {
  args: { status: 'accepted' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Accepted')
  },
}

/** Declined by the owner. */
export const Declined: Story = {
  args: { status: 'declined' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Declined')
  },
}

/** Another worker was chosen. */
export const NotSelected: Story = {
  args: { status: 'notSelected' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Not selected')
  },
}

/** Visitors do not see amounts: the price column is gone. */
export const HiddenPrice: Story = {
  args: { showPrice: false },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByText('£85')).toBeNull()
  },
}

/** No message and no times: just the name, price and any actions. */
export const NoMessage: Story = {
  args: {
    message: null,
    availabilityLabel: null,
    respondedLabel: null,
    onAccept: fn(),
    onDecline: fn(),
  },
}

/** A long message is cut after two lines. */
export const LongMessage: Story = {
  args: {
    message:
      'I have fitted dozens of shelves in plasterboard and brick walls, so I will bring the right fixings and a stud finder, check for pipes and cables first, and tidy up after. Happy to start any weekday after 5pm or on Saturday morning, and I can send photos of similar jobs if that helps.',
  },
}

/** A very long name truncates beside the price. */
export const LongName: Story = {
  args: {
    name: 'Alexandria Montgomery-Featherstonehaugh & Sons Handyman Services',
    avatarLabel: 'AM',
    showVerified: true,
    isBestMatch: true,
  },
}

/** Accept in progress: both buttons disabled, Accept shows its spinner. */
export const AcceptLoading: Story = {
  args: { onAccept: fn(), onDecline: fn(), acceptLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvasElement.querySelector('button[data-loading]'),
    ).toBeDisabled()
    expect(canvas.getByRole('button', { name: 'Decline' })).toBeDisabled()
  },
}

/** Decline in progress: both buttons disabled, Decline shows its spinner. */
export const DeclineLoading: Story = {
  args: { onAccept: fn(), onDecline: fn(), declineLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvasElement.querySelector('button[data-loading]'),
    ).toBeDisabled()
    expect(canvas.getByRole('button', { name: 'Accept' })).toBeDisabled()
  },
}

/** In a list the rows carry a hairline under them. */
export const WithDivider: Story = {
  args: { withDivider: true },
}

/** Phone width: the message lines up under the name instead of the avatar gutter. */
export const Phone: Story = {
  args: { onAccept: fn(), onDecline: fn(), showVerified: true },
  globals: { viewport: { value: 'mobile1' } },
}

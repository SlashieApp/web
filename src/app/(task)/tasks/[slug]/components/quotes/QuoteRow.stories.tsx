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

/** Read-only row with the worker's initials, price, times and message. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Jordan Lee')
    await canvas.findByText('£85')
    expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/**
 * The worker's account is suspended (BE-108): "Account suspended", and
 * Accept stays off.
 */
export const AccountSuspended: Story = {
  args: {
    onAccept: fn(),
    accountSuspended: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Account suspended')
    await expect(canvas.getByRole('button', { name: 'Accept' })).toBeDisabled()
  },
}

/** Owner with a pending quote: Message and Accept, and nothing else to answer with. */
export const OwnerActions: Story = {
  args: {
    onAccept: fn(),
    messageHref: '/messages',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Message' })
    expect(canvas.queryByRole('button', { name: 'Decline' })).toBeNull()
    await userEvent.click(await canvas.findByRole('button', { name: 'Accept' }))
    await expect(args.onAccept).toHaveBeenCalledOnce()
  },
}

/** The cheapest recent quote among several: a "Best match" badge. */
export const BestMatch: Story = {
  args: { isBestMatch: true, onAccept: fn() },
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

/** Over without being accepted, for any reason: one neutral "Closed". */
export const Closed: Story = {
  args: { status: 'closed' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Closed')
  },
}

/**
 * Another worker's quote, as anyone but the owner sees it (FE-370): "Worker",
 * a plain placeholder avatar, the price, times and message, and no photo,
 * profile link or verified mark even when they are passed in.
 */
export const Anonymous: Story = {
  args: {
    name: 'Worker',
    anonymous: true,
    avatarUrl: PHOTO,
    workerProfileHref: '/workers/worker-detail-1',
    showVerified: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Worker')
    await canvas.findByText('£85')
    await canvas.findByText('I can do this Saturday morning with my own tools.')
    await canvas.findByText('Sat 14 Jun, 09:00 · Responded 2 hours ago')
    expect(canvas.queryByRole('link')).toBeNull()
    expect(canvas.queryByRole('img')).toBeNull()
    expect(canvas.queryByLabelText('Identity verified')).toBeNull()
    expect(canvas.queryByText('JL')).toBeNull()
  },
}

/** Phone width, another worker's quote: the placeholder beside "Worker". */
export const AnonymousPhone: Story = {
  args: { name: 'Worker', anonymous: true },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Worker')
  },
}

/** Should a quote come back without a price: the column is left out, no placeholder. */
export const NoPrice: Story = {
  args: { priceLabel: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Jordan Lee')
    expect(canvas.queryByText('£85')).toBeNull()
    expect(canvas.queryByText('—')).toBeNull()
  },
}

/** No message and no times: just the name, price and any actions. */
export const NoMessage: Story = {
  args: {
    message: null,
    availabilityLabel: null,
    respondedLabel: null,
    onAccept: fn(),
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

/** Accept in progress: the button is disabled and shows its spinner. */
export const AcceptLoading: Story = {
  args: { onAccept: fn(), acceptLoading: true },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('button[data-loading]'),
    ).toBeDisabled()
  },
}

/** In a list the rows carry a hairline under them. */
export const WithDivider: Story = {
  args: { withDivider: true },
}

/** Phone width: the message lines up under the name instead of the avatar gutter. */
export const Phone: Story = {
  args: { onAccept: fn(), showVerified: true },
  globals: { viewport: { value: 'mobile1' } },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { ChatScreen } from './ChatScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone

/**
 * Story-only: taps send, unless the screen's autoplay beat (about 2.6 s after
 * it starts) already did, then waits for the worker's reply.
 */
async function sendMessage(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  // Before the beat the composer holds the draft; after it, the placeholder.
  if (!canvas.queryByText(copy.chat.composer)) {
    const send = await canvas.findByRole('button', {
      name: copy.chat.sendLabel,
    })
    await userEvent.click(send)
    // A mouse tap leaves no focus ring; the synthetic click would.
    send.blur()
  }
  await expect(await canvas.findByText(copy.chat.composer)).toBeInTheDocument()
  // The reply follows the sent message after a short typing pause.
  await expect(
    await canvas.findByText(copy.chat.reply, {}, { timeout: 4000 }),
  ).toBeInTheDocument()
}

const meta = {
  title: 'Marketing/Landing/ChatScreen',
  component: ChatScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof ChatScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the "Quote accepted" line and the chat bubbles are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/**
 * Playing: the thread starts on "Quote accepted" (people message once a quote
 * is accepted), then two bubbles enter and the send button pulses until it is
 * tapped.
 */
export const Playing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const accepted = canvasElement.querySelector('[data-chat-accepted]')
    if (!accepted) throw new Error('The "Quote accepted" line is missing')
    await expect(accepted).toHaveTextContent(copy.hire.acceptedTitle)
    await expect(accepted).toHaveTextContent(copy.chat.acceptedBody)
    // It comes before the first message.
    const first = canvas.getByText(copy.chat.theirs)
    await expect(
      accepted.compareDocumentPosition(first) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  },
}

/** Sent: the message is in the thread and the worker has replied. */
export const Sent: Story = {
  play: ({ canvasElement }) => sendMessage(canvasElement),
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the bar, the "Quote
 * accepted" line and the composer with its draft, the send button pulsing.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [
      copy.hire.acceptedTitle,
      copy.chat.acceptedBody,
      copy.chat.sent,
    ]),
}

/** Cropped phone, sent: the message and the worker's reply are whole between the accepted line and the composer. */
export const CompactSent: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await sendMessage(canvasElement)
    await expectFitsTheCrop(canvasElement, [
      copy.hire.acceptedTitle,
      copy.chat.sent,
      copy.chat.reply,
      copy.chat.composer,
    ])
  },
}

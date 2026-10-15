import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PhoneFrame } from '../PhoneFrame'
import { ChatScreen } from './ChatScreen'

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
  // The landing's phone: the screen inside its frame on the mint wash.
  decorators: [
    (Story) => (
      <Box
        p={{ base: 4, md: 8 }}
        bg="status.success.soft"
        display="inline-block"
      >
        <PhoneFrame label={copy.demoLabel} nominalWidth={300} w="300px">
          <Story />
        </PhoneFrame>
      </Box>
    ),
  ],
} satisfies Meta<typeof ChatScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the quote flash and the chat bubbles are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: a quote flash and two bubbles enter, the send button pulses until it is tapped. */
export const Playing: Story = {}

/** Sent: the message is in the thread and the worker has replied. */
export const Sent: Story = {
  play: ({ canvasElement }) => sendMessage(canvasElement),
}

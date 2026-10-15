import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PhoneFrame } from '../PhoneFrame'
import { WorkerQuoteScreen } from './WorkerQuoteScreen'

const copy = messages.en.landing.phone

/**
 * Story-only: taps "Send quote", unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for the finished screen.
 */
async function sendQuote(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  if (!canvas.queryByText(copy.worker.sentBody)) {
    const submit = await canvas.findByRole('button', {
      name: copy.worker.submit,
    })
    await userEvent.click(submit)
    // A mouse tap leaves no focus ring; the synthetic click would.
    submit.blur()
  }
  await expect(
    await canvas.findByText(copy.worker.sentBody),
  ).toBeInTheDocument()
  // The message keeps typing meanwhile: wait for the whole sentence.
  await waitFor(
    () => expect(canvas.getByText(copy.worker.message)).toBeInTheDocument(),
    { timeout: 4000 },
  )
}

const meta = {
  title: 'Marketing/Landing/WorkerQuoteScreen',
  component: WorkerQuoteScreen,
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
} satisfies Meta<typeof WorkerQuoteScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the task, price and message cards are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the message types itself, then autoplay taps "Send quote". */
export const Playing: Story = {}

/** Quote sent: message typed, toast and button confirm the quote. */
export const QuoteSent: Story = {
  play: ({ canvasElement }) => sendQuote(canvasElement),
}

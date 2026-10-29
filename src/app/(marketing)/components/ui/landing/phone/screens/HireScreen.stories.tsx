import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { PhoneFrame } from '../PhoneFrame'
import { HireScreen } from './HireScreen'

const copy = messages.en.landing.phone

/**
 * Story-only: taps "Accept quote", unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for the confirmation.
 */
async function acceptQuote(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  if (!canvas.queryByText(copy.hire.acceptedBody)) {
    const accept = await canvas.findByRole('button', {
      name: copy.hire.accept,
    })
    await userEvent.click(accept)
    // A mouse tap leaves no focus ring; the synthetic click would.
    accept.blur()
  }
  await expect(
    await canvas.findByText(copy.hire.acceptedBody),
  ).toBeInTheDocument()
}

const meta = {
  title: 'Marketing/Landing/HireScreen',
  component: HireScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the screen inside its frame on the white page.
  decorators: [
    (Story) => (
      <Box p={{ base: 4, md: 8 }} bg="bg.surface" display="inline-block">
        <PhoneFrame label={copy.demoLabel} nominalWidth={300} w="300px">
          <Story />
        </PhoneFrame>
      </Box>
    ),
  ],
} satisfies Meta<typeof HireScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the quote sheet is slid away until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: the quote sheet rises over the map and "Accept quote" pulses. */
export const Playing: Story = {}

/** Accepted: the sheet shows the booking confirmation and a done button. */
export const Accepted: Story = {
  play: ({ canvasElement }) => acceptQuote(canvasElement),
}

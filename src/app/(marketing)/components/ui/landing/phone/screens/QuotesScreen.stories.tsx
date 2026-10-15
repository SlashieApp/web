import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { PhoneFrame } from '../PhoneFrame'
import { QuotesScreen } from './QuotesScreen'

const copy = messages.en.landing.phone

/**
 * Story-only: taps the first quote, unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for its expanded details.
 */
async function openFirstQuote(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  if (!canvas.queryByText(copy.quotes.replies)) {
    const quote = await canvas.findByRole('button', {
      name: formatMessage(copy.quotes.expand, {
        name: copy.quotes.items[0].name,
      }),
    })
    await userEvent.click(quote)
    // A mouse tap leaves no focus ring; the synthetic click would.
    quote.blur()
  }
  await expect(await canvas.findByText(copy.quotes.replies)).toBeInTheDocument()
}

const meta = {
  title: 'Marketing/Landing/QuotesScreen',
  component: QuotesScreen,
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
} satisfies Meta<typeof QuotesScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the three quotes are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/** Playing: three quotes arrive one by one and the first pulses until it is opened. */
export const Playing: Story = {}

/** Quote open: the first quote is expanded with its jobs done and reply time. */
export const QuoteOpen: Story = {
  play: ({ canvasElement }) => openFirstQuote(canvasElement),
}

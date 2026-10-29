import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { PhoneFrame } from '../PhoneFrame'
import { SearchScreen } from './SearchScreen'

const copy = messages.en.landing.phone

/**
 * Story-only: taps the second pin, unless the screen's autoplay beat (about
 * 2.6 s after it starts) already did, then waits for that task's card.
 */
async function tapSecondPin(
  canvasElement: HTMLElement,
  taskId: 'hedge' | 'wardrobe',
) {
  const canvas = within(canvasElement)
  const task = copy.tasks[taskId]
  if (!canvas.queryByText(task.title)) {
    const pin = await canvas.findByRole('button', {
      name: formatMessage(copy.search.selectPin, { price: task.price }),
    })
    await userEvent.click(pin)
    // A mouse tap leaves no focus ring; the synthetic click would.
    pin.blur()
  }
  await expect(await canvas.findByText(task.title)).toBeInTheDocument()
}

const meta = {
  title: 'Marketing/Landing/SearchScreen',
  component: SearchScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    copy: { control: false },
    variant: { control: 'inline-radio', options: ['customer', 'worker'] },
  },
  args: { copy, active: true, intro: true, variant: 'customer' },
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
} satisfies Meta<typeof SearchScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the phone is off screen, so pins and card are hidden. */
export const Resting: Story = {
  args: { active: false },
}

/** Customer, playing: pins and card enter, the second pin pulses, autoplay taps it. */
export const Customer: Story = {}

/** Customer after the tap: the second pin is selected and its task card shows. */
export const CustomerPinTapped: Story = {
  play: ({ canvasElement }) => tapSecondPin(canvasElement, 'hedge'),
}

/** Worker, playing: the card carries "Send quote"; the second pin pulses. */
export const Worker: Story = {
  args: { variant: 'worker' },
}

/** Worker after the tap: the second pin is selected, its card offers "Send quote". */
export const WorkerPinTapped: Story = {
  args: { variant: 'worker' },
  play: ({ canvasElement }) => tapSecondPin(canvasElement, 'wardrobe'),
}

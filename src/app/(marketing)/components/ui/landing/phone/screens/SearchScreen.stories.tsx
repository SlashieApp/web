import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { SearchScreen } from './SearchScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

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
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
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

/**
 * The card's tile wears the task's own icon (`DEMO_TASK_ICONS`, not one plant
 * for every task): the second task's tile differs
 * from the first's.
 */
export const CardIconFollowsTheTask: Story = {
  play: async ({ canvasElement }) => {
    const tile = () =>
      canvasElement.querySelector<SVGElement>('[data-search-card] svg')
    const first = tile()?.innerHTML
    await tapSecondPin(canvasElement, 'hedge')
    const second = tile()?.innerHTML
    await expect(first).toBeTruthy()
    await expect(second).toBeTruthy()
    await expect(second).not.toBe(first)
  },
}

/** Worker, playing: the same map with "Tasks near you" in the search field; the second pin pulses. */
export const Worker: Story = {
  args: { variant: 'worker' },
}

/** Worker after the tap: the second pin is selected and its task's card shows (its kind, price, distance and date). */
export const WorkerPinTapped: Story = {
  args: { variant: 'worker' },
  play: ({ canvasElement }) => tapSecondPin(canvasElement, 'wardrobe'),
}

/**
 * Cropped phone (the inline steps below `lg`), customer: three pins over the
 * map and the selected task's card resting above the crop; the second pin
 * pulses.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) => expectFitsTheCrop(canvasElement),
}

/** Cropped phone, customer after the tap: the second task's card is whole above the crop. */
export const CompactPinTapped: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await tapSecondPin(canvasElement, 'hedge')
    await expectFitsTheCrop(canvasElement, [
      copy.tasks.hedge.title,
      copy.tasks.hedge.price,
    ])
  },
}

/** Cropped phone, worker after the tap: the second task's card is whole above the crop. */
export const CompactWorkerPinTapped: Story = {
  args: { compact: true, variant: 'worker' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await tapSecondPin(canvasElement, 'wardrobe')
    await expectFitsTheCrop(canvasElement, [
      copy.tasks.wardrobe.title,
      copy.tasks.wardrobe.kind,
    ])
  },
}

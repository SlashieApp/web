import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { QuotesScreen } from './QuotesScreen'
import { expectFitsTheCrop, withDemoPhone } from './screenStoryDecorator'

const copy = messages.en.landing.phone
const [best, arriving, last] = copy.quotes.items

/** Story-only: the row of one quote. */
function row(canvasElement: HTMLElement, name: string): HTMLElement {
  const el = canvasElement.querySelector<HTMLElement>(
    `[data-quote-row="${name}"]`,
  )
  if (!el) throw new Error(`The quote from ${name} is missing`)
  return el
}

/** Story-only: how many quotes the head counts. */
function count(canvasElement: HTMLElement): string {
  return (
    canvasElement.querySelector('[data-quotes-count]')?.textContent?.trim() ??
    ''
  )
}

/**
 * Story-only: waits for the screen's beat (it plays by itself about 2.6 s
 * after the screen starts): the third quote is in and the head counts three.
 */
async function quoteArrives(canvasElement: HTMLElement) {
  await waitFor(() => expect(count(canvasElement)).toBe('3'), {
    timeout: 5000,
  })
  await waitFor(
    () =>
      expect(
        row(canvasElement, arriving.name).closest('[aria-hidden="true"]'),
      ).toBeNull(),
    { timeout: 3000 },
  )
}

const meta = {
  title: 'Marketing/Landing/QuotesScreen',
  component: QuotesScreen,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: { copy: { control: false } },
  args: { copy, active: true, intro: true },
  // The landing's phone: the pinned one, or the cropped one with `compact`.
  decorators: [withDemoPhone],
} satisfies Meta<typeof QuotesScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Resting (not active): the quotes are hidden until the screen plays. */
export const Resting: Story = {
  args: { active: false },
}

/**
 * Playing: the customer's task page on its quotes, as the app draws it. Two
 * quotes are in (the cheapest wears Best match), each with when the worker
 * can come, the price, their message and Accept; Preview is pinned at the
 * foot.
 */
export const Playing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = row(canvasElement, best.name)
    await expect(first).toHaveTextContent(copy.quotes.bestMatch)
    await expect(first).toHaveTextContent(best.slot)
    await expect(first).toHaveTextContent(best.price)
    await expect(first).toHaveTextContent(copy.quotes.accept)
    await expect(row(canvasElement, last.name)).not.toHaveTextContent(
      copy.quotes.bestMatch,
    )
    await expect(canvas.getByText(copy.quotes.preview)).toBeInTheDocument()
  },
}

/**
 * A quote arrives: the app's banner says who sent it, their row opens between
 * the other two (cheapest first) and the head counts three.
 */
export const QuoteArrives: Story = {
  play: async ({ canvasElement }) => {
    await quoteArrives(canvasElement)
    await expect(row(canvasElement, arriving.name)).toHaveTextContent(
      arriving.price,
    )
    // Cheapest first: it sits between the other two.
    const names = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-quote-row]'),
    ].map((el) => el.dataset.quoteRow)
    await expect(names).toEqual([best.name, arriving.name, last.name])
  },
}

/**
 * Cropped phone (the inline steps below `lg`), playing: the first quote is
 * whole; the list runs under the crop and fades out there.
 */
export const Compact: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: ({ canvasElement }) =>
    expectFitsTheCrop(canvasElement, [
      best.name,
      best.price,
      copy.quotes.bestMatch,
    ]),
}

/** Cropped phone, a quote has arrived: the first quote is still whole, and the bar counts three. */
export const CompactQuoteArrives: Story = {
  args: { compact: true },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await quoteArrives(canvasElement)
    await expectFitsTheCrop(canvasElement, [best.name, best.price])
  },
}

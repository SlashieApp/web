import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { CUSTOMER_TILE_KEYS, CustomerTiles } from './CustomerTiles'

const landing = messages.en.landing
const steps = landing.story.customer.steps

/** A tile, by its step. */
function tile(canvasElement: HTMLElement, key: string) {
  const found = canvasElement.querySelector<HTMLElement>(
    `[data-customer-tile="${key}"]`,
  )
  if (!found) throw new Error(`No ${key} tile`)
  return found
}

const meta = {
  title: 'Marketing/Landing/CustomerTiles',
  component: CustomerTiles,
  parameters: { layout: 'fullscreen' },
  args: { steps, copy: landing.tiles },
} satisfies Meta<typeof CustomerTiles>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop: a hero and a strip. The post form spans two columns beside the
 * quote chips; under them the figure, the messages and the stars. Five h2
 * titles name the section; each picture plays its beat once (the button
 * settles to Posted, the chips arrive, the reply lands, the stars fill).
 */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const titles = canvas.getAllByRole('heading', { level: 2 })
    await expect(titles.map((title) => title.textContent)).toEqual(
      CUSTOMER_TILE_KEYS.map((key) => steps[key].title),
    )

    // The form's tile is the hero: twice as wide as the tile beside it.
    const post = tile(canvasElement, 'post').getBoundingClientRect()
    const quotes = tile(canvasElement, 'quotes').getBoundingClientRect()
    const hire = tile(canvasElement, 'hire').getBoundingClientRect()
    await expect(Math.round(post.top)).toBe(Math.round(quotes.top))
    await expect(post.width).toBeGreaterThan(quotes.width * 1.9)
    await expect(hire.top).toBeGreaterThan(post.top)

    // The stat is type, read as it is: Slashie's cut, 0%.
    await expect(canvas.getByText(landing.tiles.hire.figure)).toBeVisible()

    // Each picture plays once: the form's button ends on Posted.
    await waitFor(
      () =>
        expect(
          tile(canvasElement, 'post').querySelector(
            '.ct-submit[data-state="done"]',
          ),
        ).not.toBeNull(),
      { timeout: 4000 },
    )
    // The pictures are decoration to a screen reader, and take no focus.
    for (const picture of canvasElement.querySelectorAll('.ct-picture')) {
      await expect(picture).toHaveAttribute('aria-hidden', 'true')
      await expect(
        picture.querySelector('button, a, input, [tabindex]'),
      ).toBeNull()
    }
  },
}

/** A phone: the tiles stack in the steps' order, and the form stacks its fields. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const tops = CUSTOMER_TILE_KEYS.map(
      (key) => tile(canvasElement, key).getBoundingClientRect().top,
    )
    await expect([...tops].sort((a, b) => a - b)).toEqual(tops)
    const width = canvasElement.getBoundingClientRect().width
    for (const key of CUSTOMER_TILE_KEYS) {
      await expect(
        tile(canvasElement, key).getBoundingClientRect().width,
      ).toBeLessThanOrEqual(width)
    }
    await waitFor(() =>
      expect(
        tile(canvasElement, 'post').querySelector('.ct-form[data-narrow]'),
      ).not.toBeNull(),
    )
  },
}

/** A tablet: two columns, the form across both. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
}

/** Traditional Chinese copy (zh_hk bag). */
export const TraditionalChinese: Story = {
  args: {
    steps: messages.zh_hk.landing.story.customer.steps,
    copy: messages.zh_hk.landing.tiles,
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
}

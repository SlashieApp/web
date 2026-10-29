import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { MapShowcase } from './MapShowcase'

const phone = messages.en.landing.phone
const zhPhone = messages.zh_hk.landing.phone

/** Resolved token values: green 400, ink, green 800, white, hairline and muted text. */
const GREEN_400 = 'rgb(0, 220, 130)'
const INK = 'rgb(10, 21, 18)'
const GREEN_800 = 'rgb(5, 104, 63)'
const WHITE = 'rgb(255, 255, 255)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const BORDER_FOCUS = 'rgb(2, 165, 103)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const BG_SUBTLE = 'rgb(244, 244, 245)'

/** The pin button for a demo task, found by its accessible name. */
function pinFor(
  canvas: ReturnType<typeof within>,
  task: keyof typeof phone.tasks,
  bag: typeof phone = phone,
) {
  return canvas.getByRole('button', {
    name: formatMessage(bag.search.selectPin, { price: bag.tasks[task].price }),
  })
}

/** The price pill inside a pin button (the thing drawn white or green). */
function pillOf(pin: HTMLElement): HTMLElement {
  const pill = pin.querySelector<HTMLElement>('[data-pin-pill]')
  if (!pill) throw new Error('The pin has no price pill')
  return pill
}

/** The card the panel shows for the selected task. */
function getCard(canvasElement: HTMLElement): HTMLElement {
  const card = canvasElement.querySelector<HTMLElement>('[data-showcase-card]')
  if (!card) throw new Error('The panel shows no task card')
  return card
}

/** The drawn map box: the pins' offset parent. */
function getMapBox(canvasElement: HTMLElement): HTMLElement {
  const box = canvasElement.querySelector('[data-map-art]')?.parentElement
  if (!box) throw new Error('The panel has no map')
  return box
}

const meta = {
  title: 'Marketing/Landing/MapShowcase',
  component: MapShowcase,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { copy: phone },
} satisfies Meta<typeof MapShowcase>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop: a section landmark named by its heading, a monochrome map with five
 * price pins (white, green 800 price) and the first one selected (green 400
 * fill, ink price), and that task's card floating over the map's bottom-left
 * corner: 12px card with a hairline, neutral tag, title at 500, ink price at
 * 600 with tabular figures, muted meta.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const heading = canvas.getByRole('heading', {
      level: 2,
      name: phone.search.workerPlaceholder,
    })
    await expect(
      canvas.getByRole('region', { name: heading.textContent ?? '' }),
    ).toBeInTheDocument()

    // Five pins, each a labelled button; the first task starts selected.
    const pins = canvas.getAllByRole('button')
    await expect(pins).toHaveLength(5)
    const selected = pinFor(canvas, 'move')
    // A single choice, not a toggle: the chosen pin is `aria-current`.
    await expect(selected).toHaveAttribute('aria-current', 'true')
    const selectedPill = getComputedStyle(pillOf(selected))
    await expect(selectedPill.backgroundColor).toBe(GREEN_400)
    await expect(selectedPill.color).toBe(INK)
    await expect(Number(selectedPill.fontWeight)).toBe(600)

    const rest = pinFor(canvas, 'wardrobe')
    await expect(rest).not.toHaveAttribute('aria-current')
    await expect(rest).not.toHaveAttribute('aria-pressed')
    const restPill = getComputedStyle(pillOf(rest))
    await expect(restPill.backgroundColor).toBe(WHITE)
    await expect(restPill.color).toBe(GREEN_800)
    await expect(restPill.borderTopWidth).toBe('1px')
    await expect(restPill.borderTopColor).toBe(BORDER_DEFAULT)
    await expect(restPill.fontVariantNumeric).toContain('tabular-nums')
    await expect(
      Number.parseFloat(restPill.borderTopLeftRadius),
    ).toBeGreaterThan(14)

    // The card of the selected task, styled like the product's task card.
    const card = getCard(canvasElement)
    const cardStyle = getComputedStyle(card)
    await expect(cardStyle.borderTopLeftRadius).toBe('12px')
    await expect(cardStyle.borderTopWidth).toBe('1px')
    await expect(cardStyle.borderTopColor).toBe(BORDER_DEFAULT)
    await expect(cardStyle.boxShadow).not.toBe('none')

    const task = phone.tasks.move
    const title = within(card).getByText(task.title)
    await expect(Number(getComputedStyle(title).fontWeight)).toBe(500)
    await expect(
      Number.parseFloat(getComputedStyle(title).letterSpacing),
    ).toBeCloseTo(-0.16, 1)
    const price = within(card).getByText(task.price)
    const priceStyle = getComputedStyle(price)
    await expect(Number(priceStyle.fontWeight)).toBe(600)
    await expect(priceStyle.fontVariantNumeric).toContain('tabular-nums')
    await expect(priceStyle.color).toBe(INK)
    const quotes = within(card).getByText(
      formatMessage(phone.search.quotes, { count: task.quotes }),
    )
    await expect(getComputedStyle(quotes).color).toBe(TEXT_MUTED)
    // The tag is neutral (grey fill), never green.
    const tag = within(card).getByText(task.area)
    await expect(getComputedStyle(tag).backgroundColor).toBe(BG_SUBTLE)

    // The map runs edge to edge across the page column: no inset, no radius,
    // no band of padding above or below it.
    const mapBox = getMapBox(canvasElement)
    const mapStyle = getComputedStyle(mapBox)
    await expect(mapStyle.borderTopLeftRadius).toBe('0px')
    await expect(mapStyle.borderTopWidth).toBe('0px')
    const section = canvasElement.querySelector('[data-map-showcase]')
    const sectionBox = section?.getBoundingClientRect()
    await expect(mapBox.getBoundingClientRect().top).toBe(sectionBox?.top)
    await expect(mapBox.getBoundingClientRect().bottom).toBe(sectionBox?.bottom)

    // From md the card floats over the map's bottom-left corner.
    const map = getMapBox(canvasElement).getBoundingClientRect()
    const cardBox = card.getBoundingClientRect()
    await expect(cardBox.left).toBeCloseTo(map.left + 20, 0)
    await expect(cardBox.bottom).toBeCloseTo(map.bottom - 20, 0)
    await expect(cardBox.width).toBeCloseTo(380, 0)
  },
}

/**
 * The map is drawn in neutral tokens only: land, parks, river and streets
 * use bg.subtle, bg.surface, border.default and border.strong. No mint, no
 * green land.
 */
export const MonochromeMap: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const art = canvasElement.querySelector('[data-map-art]')
    await expect(art).not.toBeNull()
    const paints = new Set(
      [...(art?.querySelectorAll('[fill], [stroke]') ?? [])].flatMap((node) =>
        [node.getAttribute('fill'), node.getAttribute('stroke')].filter(
          (value): value is string => value !== null && value !== 'none',
        ),
      ),
    )
    await expect([...paints].sort()).toEqual([
      'var(--chakra-colors-bg-subtle)',
      'var(--chakra-colors-bg-surface)',
      'var(--chakra-colors-border-default)',
      'var(--chakra-colors-border-strong)',
    ])
    // Decorative: not in the accessibility tree.
    await expect(art).toHaveAttribute('aria-hidden', 'true')
  },
}

/**
 * Clicking a pin selects it: its pill turns green 400 with an ink price, the
 * old selection goes back to white, and the card shows that task.
 */
export const SelectsAPin: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(pinFor(canvas, 'wardrobe'))

    await expect(pinFor(canvas, 'wardrobe')).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(pinFor(canvas, 'move')).not.toHaveAttribute('aria-current')
    // The fill changes over 200ms, so read it once it has settled.
    await waitFor(() =>
      expect(
        getComputedStyle(pillOf(pinFor(canvas, 'wardrobe'))).backgroundColor,
      ).toBe(GREEN_400),
    )
    await waitFor(() =>
      expect(
        getComputedStyle(pillOf(pinFor(canvas, 'move'))).backgroundColor,
      ).toBe(WHITE),
    )

    const card = getCard(canvasElement)
    await expect(card).toHaveAttribute('data-showcase-card', 'wardrobe')
    await expect(
      within(card).getByText(phone.tasks.wardrobe.title),
    ).toBeInTheDocument()
    await expect(within(card).queryByText(phone.tasks.move.title)).toBeNull()
    // The panel only ever shows one card.
    await expect(
      canvasElement.querySelectorAll('[data-showcase-card]'),
    ).toHaveLength(1)
  },
}

/**
 * Keyboard: each pin is a tab stop, in reading order (top to bottom); Enter
 * and Space select it; the focused pin gets the visible green 600 ring.
 */
export const KeyboardSelects: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.tab()
    await expect(pinFor(canvas, 'move')).toHaveFocus()
    await userEvent.tab()
    await expect(pinFor(canvas, 'wardrobe')).toHaveFocus()
    await waitFor(() => {
      const ring = getComputedStyle(pillOf(pinFor(canvas, 'wardrobe')))
      expect(ring.outlineStyle).toBe('solid')
      expect(ring.outlineWidth).toBe('2px')
      expect(ring.outlineColor).toBe(BORDER_FOCUS)
    })

    await userEvent.keyboard('{Enter}')
    await expect(pinFor(canvas, 'wardrobe')).toHaveAttribute(
      'aria-current',
      'true',
    )
    // Pressing the chosen pin again does nothing: it stays chosen (it is a
    // choice, not a toggle).
    await userEvent.keyboard('{Enter}')
    await expect(pinFor(canvas, 'wardrobe')).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(getCard(canvasElement)).toHaveAttribute(
      'data-showcase-card',
      'wardrobe',
    )

    await userEvent.tab()
    await expect(pinFor(canvas, 'paint')).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(getCard(canvasElement)).toHaveAttribute(
      'data-showcase-card',
      'paint',
    )
    await expect(
      within(getCard(canvasElement)).getByText(phone.tasks.paint.title),
    ).toBeInTheDocument()
  },
}

/**
 * A phone: the map keeps its shape, every pin is a 44px target and inside the
 * map, nothing overflows sideways, and the card sits under the map (not over
 * it), so the pins and the card never cover one another.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const map = getMapBox(canvasElement).getBoundingClientRect()
    const card = getCard(canvasElement).getBoundingClientRect()

    // Under the map, not floating over it. The map runs edge to edge; the card
    // sits on the page's 16px gutters under it.
    await expect(card.top).toBeGreaterThanOrEqual(map.bottom)
    await expect(map.left).toBe(0)
    await expect(map.width).toBe(canvasElement.ownerDocument.body.clientWidth)
    await expect(card.left).toBe(16)
    await expect(card.width).toBe(map.width - 32)

    for (const task of Object.keys(
      phone.tasks,
    ) as (keyof typeof phone.tasks)[]) {
      const box = pinFor(canvas, task).getBoundingClientRect()
      await expect(box.height).toBeGreaterThanOrEqual(44)
      await expect(box.width).toBeGreaterThanOrEqual(44)
      await expect(box.left).toBeGreaterThanOrEqual(map.left)
      await expect(box.right).toBeLessThanOrEqual(map.right)
      await expect(box.top).toBeGreaterThanOrEqual(map.top)
      await expect(box.bottom).toBeLessThanOrEqual(map.bottom)
    }

    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** A phone, with the task that has the longest title selected: the title wraps to two lines at most. */
export const MobileLongTitle: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(pinFor(canvas, 'hedge'))
    const card = getCard(canvasElement)
    const title = within(card).getByText(phone.tasks.hedge.title)
    const style = getComputedStyle(title)
    await expect(title.getBoundingClientRect().height).toBeLessThanOrEqual(
      Number.parseFloat(style.lineHeight) * 2 + 1,
    )
    const map = getMapBox(canvasElement).getBoundingClientRect()
    await expect(card.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      map.bottom,
    )
  },
}

/** A tablet (md): the card already floats over the map's corner and keeps clear of every pin. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const card = getCard(canvasElement).getBoundingClientRect()
    const map = getMapBox(canvasElement).getBoundingClientRect()
    await expect(card.bottom).toBeLessThan(map.bottom)
    await expect(card.left).toBeGreaterThan(map.left)
    for (const task of Object.keys(
      phone.tasks,
    ) as (keyof typeof phone.tasks)[]) {
      const box = pinFor(canvas, task).getBoundingClientRect()
      const apart =
        box.right <= card.left ||
        box.left >= card.right ||
        box.bottom <= card.top ||
        box.top >= card.bottom
      await expect(apart, `${task} pin is clear of the card`).toBe(true)
    }
  },
}

/** Traditional Chinese copy (zh_hk bag): the pin labels, the heading and the card all read from it. */
export const TraditionalChinese: Story = {
  args: { copy: zhPhone },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', {
        level: 2,
        name: zhPhone.search.workerPlaceholder,
      }),
    ).toBeInTheDocument()
    await userEvent.click(pinFor(canvas, 'clean', zhPhone))
    const card = getCard(canvasElement)
    await expect(
      within(card).getByText(zhPhone.tasks.clean.title),
    ).toBeInTheDocument()
    await expect(
      within(card).getByText(
        formatMessage(zhPhone.search.quotes, {
          count: zhPhone.tasks.clean.quotes,
        }),
      ),
    ).toBeInTheDocument()
  },
}

/**
 * The pins' area labels are 12px in `text.muted` (6:1 on the map's park fill),
 * not 11px `text.subtle` (4.1:1 on it).
 */
export const AreaLabelsAreReadable: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const task of Object.keys(
      phone.tasks,
    ) as (keyof typeof phone.tasks)[]) {
      const label = within(pinFor(canvas, task)).getByText(
        phone.tasks[task].area,
      )
      const style = getComputedStyle(label)
      await expect(style.fontSize).toBe('12px')
      await expect(style.color).toBe(TEXT_MUTED)
    }
  },
}

/**
 * On a phone the card is under the map and can be below the fold: choosing a
 * pin from the keyboard brings the card on screen, just far enough.
 */
export const KeyboardChoiceBringsTheCardIntoView: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  decorators: [
    (Story) => (
      <div>
        {/* Pushes the map down so the card is under the screen's foot. */}
        <div style={{ height: '320px' }} />
        <Story />
        <div style={{ height: '200vh' }} />
      </div>
    ),
  ],
  beforeEach: () => () => window.scrollTo(0, 0),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cardBottom = () =>
      getCard(canvasElement).getBoundingClientRect().bottom
    window.scrollTo(0, 0)
    // The pin is on screen, the card is not.
    await expect(
      pinFor(canvas, 'move').getBoundingClientRect().bottom,
    ).toBeLessThan(window.innerHeight)
    await expect(cardBottom()).toBeGreaterThan(window.innerHeight)

    pinFor(canvas, 'move').focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(
      () => expect(cardBottom()).toBeLessThanOrEqual(window.innerHeight),
      {
        timeout: 4000,
      },
    )
    await expect(pinFor(canvas, 'move')).toHaveAttribute('aria-current', 'true')
  },
}

/** A click does not scroll the page: only the keyboard asks for the card. */
export const ClickDoesNotScroll: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  decorators: [
    (Story) => (
      <div>
        <div style={{ height: '320px' }} />
        <Story />
        <div style={{ height: '200vh' }} />
      </div>
    ),
  ],
  beforeEach: () => () => window.scrollTo(0, 0),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    window.scrollTo(0, 0)
    await userEvent.click(pinFor(canvas, 'wardrobe'))
    await expect(pinFor(canvas, 'wardrobe')).toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(window.scrollY).toBe(0)
  },
}

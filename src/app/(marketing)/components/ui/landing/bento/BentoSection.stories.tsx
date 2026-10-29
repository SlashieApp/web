import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import messages from '@/app/(marketing)/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'

import { BentoSection } from './BentoSection'

const { story, phone } = messages.en.landing
const zh = messages.zh_hk.landing
const steps = story.customer.steps

/** Resolved token values the stories check. */
const WHITE = 'rgb(255, 255, 255)'
const BG_CANVAS = 'rgb(250, 250, 250)'
const INK = 'rgb(10, 21, 18)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const BORDER_STRONG = 'rgb(212, 212, 216)'
const BORDER_FOCUS = 'rgb(2, 165, 103)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const GREEN_400 = 'rgb(0, 220, 130)'
const SUCCESS_SOFT = 'rgb(231, 251, 240)'
const SUCCESS_FG = 'rgb(5, 104, 63)'
const SUCCESS_BORDER = 'rgb(198, 246, 221)'

/** Story-only: the section in the marketing frame, between two section rules, as `home/page.tsx` sets it. */
const withFrame: Decorator = (Story) => (
  <MarketingFrame>
    <SectionRule />
    <Story />
    <SectionRule />
  </MarketingFrame>
)

type SnippetKey = 'post' | 'quotes' | 'accepted'

const SNIPPET_TITLES: Record<SnippetKey, string> = {
  post: steps.post.title,
  quotes: steps.quotes.title,
  accepted: steps.hire.title,
}

/** A snippet's panel: a figure named by its cell's heading. */
function snippet(
  canvas: ReturnType<typeof within>,
  key: SnippetKey,
  titles: Record<SnippetKey, string> = SNIPPET_TITLES,
): HTMLElement {
  return canvas.getByRole('figure', { name: titles[key] })
}

/** A cell of the bento, by its step. */
function cell(
  canvasElement: HTMLElement,
  key: 'post' | 'quotes' | 'hire',
): HTMLElement {
  const found = canvasElement.querySelector<HTMLElement>(
    `[data-bento-cell="${key}"]`,
  )
  if (!found) throw new Error(`The bento has no "${key}" cell`)
  return found
}

const KEYS = ['post', 'quotes', 'hire'] as const

const meta = {
  title: 'Marketing/Landing/BentoSection',
  component: BentoSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { steps, phone },
  decorators: [withFrame],
} satisfies Meta<typeof BentoSection>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop: one section landmark named by its three cell titles, three cells
 * side by side divided by 1px hairlines (no line before the first: the frame's
 * rail is there), each a title (500, tight tracking) over its body in muted
 * text and a snippet on a `bg.canvas` panel. The panels start on one line
 * whatever the length of the copy above them (the cells share their rows).
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const section = canvas.getByRole('region', {
      name: `${steps.post.title} ${steps.quotes.title} ${steps.hire.title}`,
    })
    await expect(getComputedStyle(section).backgroundColor).toBe(WHITE)

    // The strings are today's: each cell's title is an h2, its body beside it.
    const headings = canvas.getAllByRole('heading', { level: 2 })
    await expect(headings.map((heading) => heading.textContent)).toEqual([
      steps.post.title,
      steps.quotes.title,
      steps.hire.title,
    ])
    for (const heading of headings) {
      const style = getComputedStyle(heading)
      await expect(Number(style.fontWeight)).toBe(500)
      await expect(style.fontSize).toBe('24px')
      await expect(Number.parseFloat(style.letterSpacing)).toBeCloseTo(-0.48, 1)
    }
    for (const key of KEYS) {
      const body = canvas.getByText(steps[key].body)
      await expect(getComputedStyle(body).color).toBe(TEXT_MUTED)
    }

    // Side by side, divided by hairlines; the first cell leaves its edge to the rail.
    const cells = KEYS.map((key) => cell(canvasElement, key))
    const boxes = cells.map((node) => node.getBoundingClientRect())
    await expect(boxes[1].left).toBeGreaterThan(boxes[0].left)
    await expect(boxes[2].left).toBeGreaterThan(boxes[1].left)
    await expect(boxes[1].top).toBe(boxes[0].top)
    await expect(boxes[2].top).toBe(boxes[0].top)
    await expect(getComputedStyle(cells[0]).borderInlineStartWidth).toBe('0px')
    for (const node of cells.slice(1)) {
      const style = getComputedStyle(node)
      await expect(style.borderInlineStartWidth).toBe('1px')
      await expect(style.borderInlineStartColor).toBe(BORDER_DEFAULT)
    }
    for (const node of cells) {
      await expect(getComputedStyle(node).borderTopWidth).toBe('0px')
    }

    // The panels: bg.canvas, a hairline, 16px corners, one line across the cells.
    const panels = (['post', 'quotes', 'accepted'] as const).map((key) =>
      snippet(canvas, key),
    )
    for (const panel of panels) {
      const style = getComputedStyle(panel)
      await expect(style.backgroundColor).toBe(BG_CANVAS)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
      await expect(style.borderTopLeftRadius).toBe('16px')
    }
    const panelBoxes = panels.map((panel) => panel.getBoundingClientRect())
    await expect(Math.abs(panelBoxes[1].top - panelBoxes[0].top)).toBeLessThan(
      1,
    )
    await expect(Math.abs(panelBoxes[2].top - panelBoxes[0].top)).toBeLessThan(
      1,
    )
    await expect(
      Math.abs(panelBoxes[1].height - panelBoxes[0].height),
    ).toBeLessThan(1)

    // On screen at load: the finished state, no row held back.
    for (const panel of panels) {
      const held = [...panel.querySelectorAll<HTMLElement>('[style]')].filter(
        (node) => node.style.opacity === '0',
      )
      await expect(held).toHaveLength(0)
    }
  },
}

/**
 * The post form's field rows, drawn like the product's: labels at 500, white
 * fields with 8px corners and a 1px `border.strong` hairline, the price in ink
 * at 600 with tabular figures. "When" is a real radio group: the chosen chip
 * wears the selected colours (success tint, green 800 label), a click or an
 * arrow key moves it.
 */
export const PostForm: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const form = within(snippet(canvas, 'post'))
    const t = phone.post

    for (const label of [
      t.whatLabel,
      t.whereLabel,
      t.whenLabel,
      t.budgetLabel,
    ]) {
      const text = form.getByText(label)
      await expect(Number(getComputedStyle(text).fontWeight)).toBe(500)
    }
    await expect(form.getByText(t.whatValue)).toBeInTheDocument()
    await expect(form.getByText(t.whereValue)).toBeInTheDocument()

    const fields = [
      ...snippet(canvas, 'post').querySelectorAll<HTMLElement>(
        '[data-bento-field]',
      ),
    ]
    await expect(fields).toHaveLength(3)
    for (const field of fields) {
      const style = getComputedStyle(field)
      await expect(style.borderTopLeftRadius).toBe('8px')
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_STRONG)
      await expect(style.backgroundColor).toBe(WHITE)
    }
    const budget = getComputedStyle(form.getByText(t.budgetValue))
    await expect(Number(budget.fontWeight)).toBe(600)
    await expect(budget.fontVariantNumeric).toContain('tabular-nums')

    // "When": a radio group named by its label, the first chip chosen.
    const group = form.getByRole('radiogroup', { name: t.whenLabel })
    const radios = within(group).getAllByRole('radio') as HTMLInputElement[]
    await expect(radios).toHaveLength(2)
    await expect(radios[0]).toBeChecked()
    const chip = (radio: HTMLElement) =>
      getComputedStyle(radio.parentElement as HTMLElement)
    await expect(chip(radios[0]).backgroundColor).toBe(SUCCESS_SOFT)
    await expect(chip(radios[0]).color).toBe(SUCCESS_FG)
    await expect(chip(radios[0]).borderTopColor).toBe(SUCCESS_BORDER)
    await expect(chip(radios[1]).backgroundColor).toBe(WHITE)
    await expect(chip(radios[1]).borderTopColor).toBe(BORDER_STRONG)
    await expect(
      Number.parseFloat(chip(radios[1]).borderTopLeftRadius),
    ).toBeGreaterThan(16)

    await userEvent.click(within(group).getByText(t.whenOther))
    await expect(radios[1]).toBeChecked()
    await expect(radios[0]).not.toBeChecked()
    await waitFor(() =>
      expect(chip(radios[1]).backgroundColor).toBe(SUCCESS_SOFT),
    )
    await waitFor(() => expect(chip(radios[0]).backgroundColor).toBe(WHITE))

    // The arrow keys move it, as in any radio group, with a visible focus ring.
    radios[1].focus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(radios[0]).toBeChecked()
    await userEvent.keyboard('{ArrowRight}')
    await expect(radios[1]).toBeChecked()
    await waitFor(() => {
      const ring = chip(radios[1])
      expect(ring.outlineStyle).toBe('solid')
      expect(ring.outlineColor).toBe(BORDER_FOCUS)
    })
  },
}

/**
 * Three quote rows: avatar, name, rating, the price in ink at 600 with tabular
 * figures, the message. The first is open; the name is a real button with
 * `aria-expanded`, and its pseudo-element stretches over the card so a click
 * anywhere on it opens it. Opening one closes the rest; opening the open one
 * closes it.
 */
export const QuotesToggle: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const figure = snippet(canvas, 'quotes')
    const quotes = within(figure)
    const t = phone.quotes
    const toggle = (index: number) =>
      quotes.getByRole('button', {
        name: formatMessage(t.expand, { name: t.items[index].name }),
      })
    const openMeta = () => quotes.queryAllByText(t.replies)

    await expect(quotes.getAllByRole('button')).toHaveLength(3)
    await expect(toggle(0)).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle(1)).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle(2)).toHaveAttribute('aria-expanded', 'false')
    await expect(openMeta()).toHaveLength(1)
    await expect(
      quotes.getByText(formatMessage(t.jobs, { count: t.items[0].jobs })),
    ).toBeInTheDocument()

    // The price and the name read like the product's quote row.
    for (const quote of t.items) {
      const price = getComputedStyle(quotes.getByText(quote.price))
      await expect(Number(price.fontWeight)).toBe(600)
      await expect(price.fontVariantNumeric).toContain('tabular-nums')
      await expect(price.color).toBe(INK)
      await expect(quotes.getByText(quote.note)).toBeInTheDocument()
    }
    const card = toggle(0).closest<HTMLElement>('[data-bento-quote]')
    if (!card) throw new Error('The quote has no card')
    const cardStyle = getComputedStyle(card)
    await expect(cardStyle.borderTopLeftRadius).toBe('12px')
    await expect(cardStyle.borderTopWidth).toBe('1px')
    await expect(cardStyle.backgroundColor).toBe(WHITE)

    // A click anywhere on a card lands on its toggle: the third card's message
    // is under the stretched pseudo-element.
    const note = quotes.getByText(t.items[2].note).getBoundingClientRect()
    const hit = canvasElement.ownerDocument.elementFromPoint(
      note.left + note.width / 2,
      note.top + note.height / 2,
    )
    await expect(hit).toBe(toggle(2))

    await userEvent.click(toggle(1))
    await expect(toggle(1)).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle(0)).toHaveAttribute('aria-expanded', 'false')
    await expect(openMeta()).toHaveLength(1)
    await expect(
      quotes.getByText(formatMessage(t.jobs, { count: t.items[1].jobs })),
    ).toBeInTheDocument()
    await expect(
      quotes.queryByText(formatMessage(t.jobs, { count: t.items[0].jobs })),
    ).toBeNull()

    // Closing the open one leaves them all closed.
    await userEvent.click(toggle(1))
    await expect(openMeta()).toHaveLength(0)
    await expect(toggle(1)).toHaveAttribute('aria-expanded', 'false')

    // Keyboard: the toggles are tab stops; Enter and Space open a row, with a
    // visible focus ring round its card.
    toggle(0).focus()
    await userEvent.tab()
    await expect(toggle(1)).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(toggle(1)).toHaveAttribute('aria-expanded', 'true')
    await userEvent.tab()
    await expect(toggle(2)).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(toggle(2)).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle(1)).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => {
      const ring = getComputedStyle(
        toggle(2).closest('[data-bento-quote]') as HTMLElement,
      )
      expect(ring.outlineStyle).toBe('solid')
      expect(ring.outlineColor).toBe(BORDER_FOCUS)
    })
  },
}

/**
 * The accepted row: the chosen quote with its booking, then the one place the
 * snippets use green as state: a soft success tint with a 1px success border
 * and a green 400 check with an ink glyph. It is a picture of the state, not a
 * second green button: there is nothing to press in it.
 */
export const AcceptedRow: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const figure = snippet(canvas, 'accepted')
    const accepted = within(figure)
    const t = phone.hire
    const quote = phone.quotes.items[0]

    await expect(accepted.getByText(quote.name)).toBeInTheDocument()
    const price = getComputedStyle(accepted.getByText(t.price))
    await expect(Number(price.fontWeight)).toBe(600)
    await expect(price.fontVariantNumeric).toContain('tabular-nums')
    await expect(price.color).toBe(INK)
    await expect(accepted.getByText(t.when)).toBeInTheDocument()
    await expect(accepted.getByText(t.note)).toBeInTheDocument()

    await expect(accepted.getByText(t.acceptedTitle)).toBeInTheDocument()
    await expect(accepted.getByText(t.acceptedBody)).toBeInTheDocument()
    const row = figure.querySelector<HTMLElement>('[data-bento-accepted]')
    const check = figure.querySelector<HTMLElement>('[data-bento-check]')
    if (!row || !check) throw new Error('The accepted row is missing')
    const rowStyle = getComputedStyle(row)
    await expect(rowStyle.backgroundColor).toBe(SUCCESS_SOFT)
    await expect(rowStyle.borderTopWidth).toBe('1px')
    await expect(rowStyle.borderTopColor).toBe(SUCCESS_BORDER)
    await expect(rowStyle.borderTopLeftRadius).toBe('12px')
    const checkStyle = getComputedStyle(check)
    await expect(checkStyle.backgroundColor).toBe(GREEN_400)
    await expect(checkStyle.color).toBe(INK)
    await expect(
      Number.parseFloat(checkStyle.borderTopLeftRadius),
    ).toBeGreaterThan(18)
    await expect(accepted.queryAllByRole('button')).toHaveLength(0)
  },
}

/**
 * A phone (320px, the narrowest): the cells stack with a hairline between
 * them (no vertical dividers), each a title and body over its snippet, all
 * inside the page's gutters with no sideways scroll.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cells = KEYS.map((key) => cell(canvasElement, key))
    const boxes = cells.map((node) => node.getBoundingClientRect())
    await expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom - 1)
    await expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[1].bottom - 1)
    await expect(boxes[0].left).toBe(0)
    await expect(boxes[1].left).toBe(0)

    await expect(getComputedStyle(cells[0]).borderTopWidth).toBe('0px')
    for (const node of cells.slice(1)) {
      const style = getComputedStyle(node)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
      await expect(style.borderInlineStartWidth).toBe('0px')
    }

    for (const [index, key] of KEYS.entries()) {
      const heading = canvas.getByRole('heading', {
        level: 2,
        name: steps[key].title,
      })
      const panel = snippet(
        canvas,
        (['post', 'quotes', 'accepted'] as const)[index],
      )
      const head = heading.getBoundingClientRect()
      const box = panel.getBoundingClientRect()
      // The snippet sits under the text, on the gutters, and fills them.
      const cellBox = cells[index].getBoundingClientRect()
      await expect(box.top).toBeGreaterThanOrEqual(head.bottom)
      await expect(box.left).toBeCloseTo(cellBox.left + 16, 0)
      await expect(box.right).toBeCloseTo(cellBox.right - 16, 0)
    }

    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * A tablet (834px, below `lg`): the cells still stack with a hairline between
 * them, and each sets its text beside its snippet.
 */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cells = KEYS.map((key) => cell(canvasElement, key))
    const boxes = cells.map((node) => node.getBoundingClientRect())
    await expect(boxes[1].top).toBeGreaterThanOrEqual(boxes[0].bottom - 1)
    for (const node of cells.slice(1)) {
      await expect(getComputedStyle(node).borderTopWidth).toBe('1px')
    }

    for (const [index, key] of KEYS.entries()) {
      const heading = canvas.getByRole('heading', {
        level: 2,
        name: steps[key].title,
      })
      const panel = snippet(
        canvas,
        (['post', 'quotes', 'accepted'] as const)[index],
      )
      const head = heading.getBoundingClientRect()
      const box = panel.getBoundingClientRect()
      // Text in the first column, the snippet in the second, from one top.
      await expect(box.left).toBeGreaterThanOrEqual(head.right)
      await expect(Math.abs(box.top - head.top)).toBeLessThan(2)
    }

    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Story-only: pushes the section below the fold, as it is on the page. */
const belowTheFold: Decorator = (Story) => (
  <>
    <Box h="150vh" aria-hidden />
    <Story />
  </>
)

/**
 * Below the fold, with motion allowed: after hydration the snippets' rows are
 * held back (opacity and an 8px rise, so nothing shifts), and when the section
 * scrolls into view they fade in, the title types itself, and the accepted
 * check lands. Reduced motion skips all of it.
 */
export const EntersOnScroll: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  decorators: [belowTheFold],
  play: async ({ canvasElement }) => {
    // Reduced motion shows the finished state from the start: nothing to wait for.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = within(canvasElement)
    const form = snippet(canvas, 'post')
    const firstRow = form.firstElementChild?.firstElementChild as HTMLElement
    const check = canvasElement.querySelector<HTMLElement>('[data-bento-check]')
    if (!firstRow || !check) throw new Error('The snippets are missing')

    await waitFor(() => expect(firstRow.style.opacity).toBe('0'))
    await expect(firstRow.style.transform).toBe('translateY(8px)')
    await expect(check.style.opacity).toBe('0')

    form.scrollIntoView({ block: 'center' })
    await waitFor(() => expect(firstRow.style.opacity).toBe('1'), {
      timeout: 3000,
    })
    await expect(firstRow.style.transform).toBe('none')
    await waitFor(() => expect(check.style.opacity).toBe('1'), {
      timeout: 3000,
    })

    // The title types itself out: first a part of it, with the field in its
    // focus colour, then the whole of it and the resting border again.
    const title = form.querySelector<HTMLElement>('[data-bento-title]')
    const field = title?.closest<HTMLElement>('[data-bento-field]')
    if (!title || !field) throw new Error('The title is missing')
    const full = phone.post.whatValue
    await waitFor(
      () => expect(title.textContent?.length).toBeLessThan(full.length),
      {
        timeout: 3000,
      },
    )
    await waitFor(() =>
      expect(getComputedStyle(field).borderTopColor).toBe(BORDER_FOCUS),
    )
    await waitFor(() => expect(title.textContent).toBe(full), {
      timeout: 10000,
    })
    await waitFor(() =>
      expect(getComputedStyle(field).borderTopColor).toBe(BORDER_STRONG),
    )
  },
}

/** Traditional Chinese copy (zh_hk bag): the titles, bodies and every snippet read from it. */
export const TraditionalChinese: Story = {
  args: { steps: zh.story.customer.steps, phone: zh.phone },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const zhSteps = zh.story.customer.steps
    const headings = canvas.getAllByRole('heading', { level: 2 })
    await expect(headings.map((heading) => heading.textContent)).toEqual([
      zhSteps.post.title,
      zhSteps.quotes.title,
      zhSteps.hire.title,
    ])
    await expect(canvas.getByText(zhSteps.quotes.body)).toBeInTheDocument()

    const titles = {
      post: zhSteps.post.title,
      quotes: zhSteps.quotes.title,
      accepted: zhSteps.hire.title,
    }
    await expect(
      within(snippet(canvas, 'post', titles)).getByText(
        zh.phone.post.whatValue,
      ),
    ).toBeInTheDocument()
    await expect(
      within(snippet(canvas, 'quotes', titles)).getByRole('button', {
        name: formatMessage(zh.phone.quotes.expand, {
          name: zh.phone.quotes.items[0].name,
        }),
      }),
    ).toBeInTheDocument()
    await expect(
      within(snippet(canvas, 'accepted', titles)).getByText(
        zh.phone.hire.acceptedTitle,
      ),
    ).toBeInTheDocument()
  },
}

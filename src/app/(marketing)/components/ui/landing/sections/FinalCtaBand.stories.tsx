import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import messages from '@/app/(marketing)/i11n.json'

import { FinalCtaBand } from './FinalCtaBand'

const { ctas } = messages.en.common
const copy = messages.en.landing.finalCta
const zhCopy = messages.zh_hk.landing.finalCta

/** The character the product's copy never uses, built here so no source line carries it. */
const EM_DASH = String.fromCodePoint(0x2014)

/** Resolved token values the stories check. */
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const WHITE = 'rgb(255, 255, 255)'
const INK = 'rgb(10, 21, 18)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const BORDER_STRONG = 'rgb(212, 212, 216)'
/** Green 400 is the primary pill's fill; 600 and 800 have no place in this section. */
const GREEN_400 = 'rgb(0, 220, 130)'
const GREENS = [GREEN_400, 'rgb(2, 165, 103)', 'rgb(5, 104, 63)']

/**
 * Story-only: the section in the marketing frame, under the section rule that
 * `home/page.tsx` puts above it (the footer is its own band below, not drawn here).
 */
const withFrame: Decorator = (Story) => (
  <MarketingFrame>
    <SectionRule />
    <Story />
  </MarketingFrame>
)

type Parts = {
  section: HTMLElement
  heading: HTMLElement
  body: HTMLElement
  primary: HTMLElement
  secondary: HTMLElement
}

/** The pieces of the section, found by the hooks and roles it exposes. */
function parts(
  canvasElement: HTMLElement,
  labels: { heading: string; body: string; primary: string; secondary: string },
): Parts {
  const canvas = within(canvasElement)
  const section = canvasElement.querySelector<HTMLElement>('[data-final-cta]')
  if (!section) throw new Error('The section is missing')
  return {
    section,
    heading: canvas.getByRole('heading', { level: 2, name: labels.heading }),
    body: canvas.getByText(labels.body),
    primary: canvas.getByRole('link', { name: labels.primary }),
    secondary: canvas.getByRole('link', { name: labels.secondary }),
  }
}

const enLabels = {
  heading: copy.heading,
  body: copy.body,
  primary: ctas.postTask,
  secondary: ctas.becomeWorker,
}

function box(node: HTMLElement) {
  return node.getBoundingClientRect()
}

/** The horizontal centre of a box. */
function centreX(node: { left: number; right: number }) {
  return (node.left + node.right) / 2
}

/** The two pills side by side or stacked, as one block: its left and right edges. */
function pair(primary: HTMLElement, secondary: HTMLElement) {
  const [first, second] = [primary, secondary].map(box)
  return {
    left: Math.min(first.left, second.left),
    right: Math.max(first.right, second.right),
  }
}

const meta = {
  title: 'Marketing/Landing/FinalCtaBand',
  component: FinalCtaBand,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    copy,
    primary: { label: ctas.postTask, href: '/register?next=%2Ftasks%2Fcreate' },
    secondary: {
      label: ctas.becomeWorker,
      href: '/register?next=%2Fworker%2Fsetup',
    },
  },
  decorators: [withFrame],
} satisfies Meta<typeof FinalCtaBand>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop: the closing beat. One centred line in `display-lg` (44/48 at 500,
 * -0.035em), one muted sentence and two pills: Post a task in green (green 400
 * with an ink label, the section's only green) and Become a worker as the
 * outline pill (white, a 1px `border.strong` hairline). The section is a
 * landmark named by its heading and is transparent, so the 3D scene's gather
 * formation shows round it.
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const { section, heading, body, primary, secondary } = parts(
      canvasElement,
      enLabels,
    )

    // A landmark named by its heading, which is the only heading in it.
    await expect(canvas.getByRole('region', { name: copy.heading })).toBe(
      section,
    )
    await expect(canvas.getAllByRole('heading')).toHaveLength(1)

    // Today's strings only, and no em dash anywhere.
    await expect(heading).toHaveTextContent(copy.heading)
    await expect(body).toHaveTextContent(copy.body)
    await expect(section.textContent).not.toContain(EM_DASH)

    // Transparent: the scene's objects gather round it, not behind a panel.
    await expect(getComputedStyle(section).backgroundColor).toBe(TRANSPARENT)

    // The heading: display-lg, 44/48 at 500, tracked -0.035em, ink, centred.
    const title = getComputedStyle(heading)
    await expect(title.fontSize).toBe('44px')
    await expect(title.lineHeight).toBe('48px')
    await expect(Number(title.fontWeight)).toBe(500)
    await expect(Number.parseFloat(title.letterSpacing)).toBeCloseTo(-1.54, 1)
    await expect(title.color).toBe(INK)
    await expect(title.textAlign).toBe('center')

    // The body: text-lg (18/28 at 400) in muted text, centred.
    const text = getComputedStyle(body)
    await expect(text.fontSize).toBe('18px')
    await expect(text.lineHeight).toBe('28px')
    await expect(Number(text.fontWeight)).toBe(400)
    await expect(text.color).toBe(TEXT_MUTED)
    await expect(text.textAlign).toBe('center')

    // The two ways in, primary first, to the localized hrefs.
    await expect(primary).toHaveAttribute('href', args.primary.href)
    await expect(secondary).toHaveAttribute('href', args.secondary.href)
    await expect(
      primary.compareDocumentPosition(secondary) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    // Post a task: the green pill with an ink label, 52px, fully round, at 500.
    const green = getComputedStyle(primary)
    await expect(green.backgroundColor).toBe(GREEN_400)
    await expect(green.color).toBe(INK)
    await expect(Number(green.fontWeight)).toBe(500)
    await expect(box(primary).height).toBeGreaterThanOrEqual(52)
    await expect(Number.parseFloat(green.borderTopLeftRadius)).toBeGreaterThan(
      box(primary).height / 2 - 1,
    )

    // Become a worker: the outline pill, white with a 1px border.strong hairline.
    const outline = getComputedStyle(secondary)
    await expect(outline.backgroundColor).toBe(WHITE)
    await expect(outline.color).toBe(INK)
    await expect(outline.borderTopWidth).toBe('1px')
    await expect(outline.borderTopColor).toBe(BORDER_STRONG)
    await expect(Number(outline.fontWeight)).toBe(500)
    await expect(box(secondary).height).toBe(box(primary).height)
    await expect(
      Number.parseFloat(outline.borderTopLeftRadius),
    ).toBeGreaterThan(box(secondary).height / 2 - 1)

    // Green does one job here: the primary pill's fill. Nothing else is green
    // (no text, line or second fill) and nothing is heavier than 600.
    const greens: HTMLElement[] = []
    for (const node of [
      section,
      ...section.querySelectorAll<HTMLElement>('*'),
    ]) {
      const style = getComputedStyle(node)
      const values = [
        style.color,
        style.backgroundColor,
        style.borderTopColor,
        style.borderLeftColor,
      ]
      if (values.some((value) => GREENS.includes(value))) greens.push(node)
      await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
    }
    await expect(greens).toEqual([primary])

    // Centred in the page: the heading, the body and the pair of pills share
    // the viewport's middle, and the block sits within its 40rem measure.
    const middle = canvasElement.ownerDocument.documentElement.clientWidth / 2
    await expect(Math.abs(centreX(box(heading)) - middle)).toBeLessThan(1.5)
    await expect(Math.abs(centreX(box(body)) - middle)).toBeLessThan(1.5)
    await expect(
      Math.abs(centreX(pair(primary, secondary)) - middle),
    ).toBeLessThan(1.5)
    await expect(box(body).width).toBeLessThanOrEqual(640)
    await expect(box(secondary).left).toBeGreaterThan(box(primary).right)
    await expect(box(primary).top).toBeGreaterThan(box(body).bottom)
    await expect(box(body).top).toBeGreaterThan(box(heading).bottom)

    // No sideways scroll.
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Longer heading and body: the text block stays centred at its 40rem measure and wraps in balanced lines. */
export const LongCopy: Story = {
  args: {
    copy: {
      heading: 'Ready to get local help, or to start earning from your skills?',
      body: 'Post a task and compare quotes from people nearby, or set up a worker profile and start quoting on tasks around you. Both take about a minute, and neither costs anything to begin.',
    },
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const { heading, body, primary, secondary } = parts(canvasElement, {
      ...enLabels,
      heading: args.copy.heading,
      body: args.copy.body,
    })
    const middle = canvasElement.ownerDocument.documentElement.clientWidth / 2
    // The heading wraps to several lines and every line stays inside 40rem.
    await expect(box(heading).height).toBeGreaterThan(48 * 2 - 1)
    await expect(box(heading).width).toBeLessThanOrEqual(640)
    await expect(box(body).width).toBeLessThanOrEqual(640)
    await expect(Math.abs(centreX(box(heading)) - middle)).toBeLessThan(1.5)
    await expect(Math.abs(centreX(box(body)) - middle)).toBeLessThan(1.5)
    // The pills sit under the text, still centred.
    await expect(box(primary).top).toBeGreaterThan(box(body).bottom)
    await expect(
      Math.abs(centreX(pair(primary, secondary)) - middle),
    ).toBeLessThan(1.5)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * A tablet (834px): the same display-lg line, centred, with the two pills side
 * by side under it.
 */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { heading, primary, secondary } = parts(canvasElement, enLabels)
    await expect(getComputedStyle(heading).fontSize).toBe('44px')
    await expect(box(secondary).left).toBeGreaterThan(box(primary).right)
    await expect(box(secondary).top).toBe(box(primary).top)
    const middle = canvasElement.ownerDocument.documentElement.clientWidth / 2
    await expect(
      Math.abs(centreX(pair(primary, secondary)) - middle),
    ).toBeLessThan(1.5)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Phone width (320px, the narrowest): the heading steps down to heading-xl
 * (34/41, the same step as a section head), the text wraps inside the page's
 * gutters and the two pills wrap onto their own rows, each centred.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { heading, body, primary, secondary } = parts(canvasElement, enLabels)
    const title = getComputedStyle(heading)
    await expect(title.fontSize).toBe('34px')
    await expect(title.lineHeight).toBe('41px')
    await expect(Number(title.fontWeight)).toBe(500)
    await expect(Number.parseFloat(title.letterSpacing)).toBeCloseTo(-1.02, 1)

    // Inside the gutters, in reading order, nothing wider than the screen.
    const width = canvasElement.ownerDocument.documentElement.clientWidth
    for (const node of [heading, body, primary, secondary]) {
      await expect(box(node).left).toBeGreaterThanOrEqual(16)
      await expect(box(node).right).toBeLessThanOrEqual(width - 16)
    }
    await expect(box(body).top).toBeGreaterThanOrEqual(box(heading).bottom)
    await expect(box(primary).top).toBeGreaterThanOrEqual(box(body).bottom)
    await expect(box(secondary).top).toBeGreaterThanOrEqual(box(primary).top)
    await expect(Math.abs(centreX(box(heading)) - width / 2)).toBeLessThan(1.5)

    // At 320px the two pills do not fit side by side: they wrap onto their own
    // rows, each keeps its 52px touch target and each is centred.
    await expect(box(secondary).top).toBeGreaterThanOrEqual(box(primary).bottom)
    for (const node of [primary, secondary]) {
      await expect(box(node).height).toBeGreaterThanOrEqual(52)
      await expect(Math.abs(centreX(box(node)) - width / 2)).toBeLessThan(1.5)
    }
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Traditional Chinese copy: the same layout, the localized labels and hrefs. */
export const TraditionalChinese: Story = {
  args: {
    copy: zhCopy,
    primary: {
      label: messages.zh_hk.common.ctas.postTask,
      href: '/zh-hk/register?next=%2Ftasks%2Fcreate',
    },
    secondary: {
      label: messages.zh_hk.common.ctas.becomeWorker,
      href: '/zh-hk/register?next=%2Fworker%2Fsetup',
    },
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const { section, primary, secondary } = parts(canvasElement, {
      heading: zhCopy.heading,
      body: zhCopy.body,
      primary: args.primary.label,
      secondary: args.secondary.label,
    })
    await expect(canvas.getByRole('region', { name: zhCopy.heading })).toBe(
      section,
    )
    await expect(primary).toHaveAttribute('href', args.primary.href)
    await expect(secondary).toHaveAttribute('href', args.secondary.href)
    await expect(getComputedStyle(primary).backgroundColor).toBe(GREEN_400)
    await expect(section.textContent).not.toContain(EM_DASH)
  },
}

import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import messages from '@/app/(marketing)/i11n.json'

import { TrustSection } from './TrustSection'

const { points } = messages.en.landing.trust
const zhPoints = messages.zh_hk.landing.trust.points

/** Resolved token values the stories check. */
const WHITE = 'rgb(255, 255, 255)'
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const INK = 'rgb(10, 21, 18)'
const GREEN_600 = 'rgb(2, 165, 103)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'

/** Story-only: the section in the marketing frame, between two section rules, as `home/page.tsx` sets it. */
const withFrame: Decorator = (Story) => (
  <MarketingFrame>
    <SectionRule />
    <Story />
    <SectionRule />
  </MarketingFrame>
)

/** The points of the section, in reading order. */
function cells(canvasElement: HTMLElement): HTMLElement[] {
  return [...canvasElement.querySelectorAll<HTMLElement>('[data-trust-point]')]
}

const meta = {
  title: 'Marketing/Landing/TrustSection',
  component: TrustSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    points,
  },
  decorators: [withFrame],
} satisfies Meta<typeof TrustSection>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Desktop: the four real reassurance points as one hairline row between the
 * rails, each a green 600 check and the point at 500 in ink. No card: the
 * section is the page's white, nothing is tinted, rounded or lifted. The points
 * are divided by 1px lines (none before the first: the frame's rail is there).
 */
export const Default: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // A plain list of today's four strings; the section has no heading of its own.
    const items = canvas.getAllByRole('listitem')
    await expect(items.map((item) => item.textContent)).toEqual([...points])
    await expect(canvas.queryAllByRole('heading')).toHaveLength(0)

    // No card: the white page, no tint, radius or shadow on the section or a point.
    const section = canvasElement.querySelector<HTMLElement>('[data-trust]')
    if (!section) throw new Error('The trust section is missing')
    // Not a `section`: with no string to name it, it would be an unnamed
    // region that claims a structure it cannot have.
    await expect(section.tagName).toBe('DIV')
    await expect(getComputedStyle(section).backgroundColor).toBe(WHITE)
    await expect(getComputedStyle(section).boxShadow).toBe('none')
    const nodes = cells(canvasElement)
    await expect(nodes).toHaveLength(4)
    for (const node of nodes) {
      const style = getComputedStyle(node)
      await expect(style.backgroundColor).toBe(TRANSPARENT)
      await expect(style.boxShadow).toBe('none')
      await expect(style.borderTopLeftRadius).toBe('0px')
    }

    // One row, side by side, divided by hairlines.
    const boxes = nodes.map((node) => node.getBoundingClientRect())
    for (const [index, box] of boxes.entries()) {
      await expect(box.top).toBe(boxes[0].top)
      if (index > 0)
        await expect(box.left).toBeGreaterThan(boxes[index - 1].left)
    }
    await expect(getComputedStyle(nodes[0]).borderInlineStartWidth).toBe('0px')
    for (const node of nodes.slice(1)) {
      const style = getComputedStyle(node)
      await expect(style.borderInlineStartWidth).toBe('1px')
      await expect(style.borderInlineStartColor).toBe(BORDER_DEFAULT)
    }
    for (const node of nodes) {
      await expect(getComputedStyle(node).borderTopWidth).toBe('0px')
    }

    // The frame's rhythm on a wide screen: 128px above and below the row.
    for (const node of nodes) {
      await expect(getComputedStyle(node).paddingTop).toBe('128px')
      await expect(getComputedStyle(node).paddingBottom).toBe('128px')
    }

    // The check is green 600 (never the green 400 fill), the point is ink at 500.
    for (const [index, node] of nodes.entries()) {
      const check = node.querySelector('svg')
      if (!check) throw new Error('A point has no check')
      await expect(getComputedStyle(check).color).toBe(GREEN_600)
      await expect(check.parentElement).toHaveAttribute('aria-hidden', 'true')
      const text = within(node).getByText(points[index])
      const style = getComputedStyle(text)
      await expect(Number(style.fontWeight)).toBe(500)
      await expect(style.color).toBe(INK)
      await expect(style.fontSize).toBe('16px')
      // The check sits beside the first line, not above the text.
      const checkBox = check.getBoundingClientRect()
      await expect(checkBox.right).toBeLessThanOrEqual(
        text.getBoundingClientRect().left,
      )
    }
  },
}

/**
 * Two points: the row keeps its column width and leaves the rest empty, with
 * the hairline still between the two.
 */
export const TwoPoints: Story = {
  args: { points: points.slice(0, 2) },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const nodes = cells(canvasElement)
    await expect(nodes).toHaveLength(2)
    const [first, second] = nodes.map((node) => node.getBoundingClientRect())
    await expect(Math.abs(first.width - second.width)).toBeLessThan(1)
    await expect(first.width).toBeLessThan(canvasElement.clientWidth / 3)
    await expect(getComputedStyle(nodes[1]).borderInlineStartWidth).toBe('1px')
  },
}

/** Long points wrap to several lines while the check icons stay top-aligned. */
export const LongText: Story = {
  args: {
    points: [
      'No platform cut from the job, ever, whatever size the task is or who does it',
      'Payment stays between customer and worker, in whatever way they both prefer',
      'Profiles, reviews, and proof of past work so you can choose with confidence',
      'Local tasks, local workers, and clear quotes before anyone commits to anything',
    ],
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const nodes = cells(canvasElement)
    await expect(nodes).toHaveLength(4)
    for (const node of nodes) {
      const check = node.querySelector('svg')
      const text = node.querySelector('p')
      if (!check || !text) throw new Error('A point is missing its parts')
      const textBox = text.getBoundingClientRect()
      // Several lines, and the check level with the first of them.
      await expect(textBox.height).toBeGreaterThan(24 * 2 - 1)
      const checkBox = check.getBoundingClientRect()
      await expect(checkBox.top).toBeGreaterThanOrEqual(textBox.top)
      await expect(checkBox.bottom).toBeLessThanOrEqual(textBox.top + 24)
    }
  },
}

/**
 * A phone (320px, the narrowest): the points stack in one column with a
 * hairline between them (no vertical divider), inside the page's gutters with
 * no sideways scroll.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const nodes = cells(canvasElement)
    const boxes = nodes.map((node) => node.getBoundingClientRect())
    for (const [index, box] of boxes.entries()) {
      await expect(box.left).toBe(0)
      if (index > 0) {
        await expect(box.top).toBeGreaterThanOrEqual(
          boxes[index - 1].bottom - 1,
        )
      }
    }
    await expect(getComputedStyle(nodes[0]).borderTopWidth).toBe('0px')
    for (const node of nodes.slice(1)) {
      const style = getComputedStyle(node)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
    }
    for (const node of nodes) {
      await expect(getComputedStyle(node).borderInlineStartWidth).toBe('0px')
    }

    // 56px under the rule above and over the rule below, 20px between points.
    const pads = nodes.map((node) => {
      const style = getComputedStyle(node)
      return [style.paddingTop, style.paddingBottom]
    })
    await expect(pads).toEqual([
      ['56px', '20px'],
      ['20px', '20px'],
      ['20px', '20px'],
      ['20px', '56px'],
    ])

    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * A tablet (834px, below `lg`): two columns, a hairline before the right-hand
 * column and above the second row.
 */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const nodes = cells(canvasElement)
    const boxes = nodes.map((node) => node.getBoundingClientRect())
    await expect(boxes[1].left).toBeGreaterThan(boxes[0].left)
    await expect(boxes[1].top).toBe(boxes[0].top)
    await expect(boxes[2].left).toBe(boxes[0].left)
    await expect(boxes[2].top).toBeGreaterThanOrEqual(boxes[0].bottom - 1)
    await expect(boxes[3].left).toBe(boxes[1].left)

    const lines = nodes.map((node) => {
      const style = getComputedStyle(node)
      return [style.borderTopWidth, style.borderInlineStartWidth]
    })
    await expect(lines).toEqual([
      ['0px', '0px'],
      ['0px', '1px'],
      ['1px', '0px'],
      ['1px', '1px'],
    ])

    // 80px under the rule above and over the rule below, 32px between rows.
    const pads = nodes.map((node) => {
      const style = getComputedStyle(node)
      return [style.paddingTop, style.paddingBottom]
    })
    await expect(pads).toEqual([
      ['80px', '32px'],
      ['80px', '32px'],
      ['32px', '80px'],
      ['32px', '80px'],
    ])

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
 * Below the fold, with motion allowed: after hydration each point is held back
 * (opacity and an 8px rise, so nothing shifts) and fades in, staggered, once
 * the section scrolls into view. Reduced motion skips all of it.
 */
export const EntersOnScroll: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  decorators: [belowTheFold],
  play: async ({ canvasElement }) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const nodes = cells(canvasElement)
    const reveals = nodes.map((node) => node.firstElementChild as HTMLElement)

    await waitFor(() => expect(reveals[0].style.opacity).toBe('0'))
    await expect(reveals[0].style.transform).toBe('translateY(8px)')

    nodes[0].scrollIntoView({ block: 'center' })
    for (const reveal of reveals) {
      await waitFor(() => expect(reveal.style.opacity).toBe('1'), {
        timeout: 3000,
      })
      await expect(reveal.style.transform).toBe('none')
    }
  },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: { points: zhPoints },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem')
    await expect(items.map((item) => item.textContent)).toEqual([...zhPoints])
    await expect(cells(canvasElement)).toHaveLength(4)
  },
}

import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import marketingMessages from '@/app/(marketing)/i11n.json'

import messages from '../i11n.json'
import { AboutScreen } from './AboutScreen'

const copy = messages.en

/** The character the product's copy never uses, built here so no source line carries it. */
const EM_DASH = String.fromCodePoint(0x2014)

/** Resolved token values the stories check. */
const WHITE = 'rgb(255, 255, 255)'
const INK = 'rgb(10, 21, 18)'
const BORDER_DEFAULT = 'rgb(228, 228, 231)'
const TEXT_MUTED = 'rgb(82, 82, 91)'
const TEXT_SUBTLE = 'rgb(107, 107, 116)'
const GREEN_400 = 'rgb(0, 220, 130)'
const GREEN_600 = 'rgb(2, 165, 103)'
/** `sizes.page`: 80rem. */
const PAGE_PX = 1280

/**
 * Story-only: the page as the marketing layout holds it, on the layout's
 * canvas colour, so the frame's white is what the page shows.
 */
const withLayout: Decorator = (Story) => (
  <Box bg="bg.canvas" minH="100dvh">
    <Box as="main" id="main-content">
      <Story />
    </Box>
  </Box>
)

const meta = {
  title: 'Marketing/About/AboutScreen',
  component: AboutScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withLayout],
  args: {
    copy,
    ctas: marketingMessages.en.common.ctas,
    view: 'guest',
    locale: 'en',
  },
} satisfies Meta<typeof AboutScreen>

export default meta
type Story = StoryObj<typeof meta>

function box(node: Element) {
  return node.getBoundingClientRect()
}

function closingLink(canvasElement: HTMLElement, name: string) {
  return within(canvasElement).getByRole('link', { name })
}

/** The pieces of the page the stories look at. */
function parts(canvasElement: HTMLElement) {
  const rails = canvasElement.querySelector<HTMLElement>(
    '[data-marketing-rails]',
  )
  const frame = rails?.parentElement
  const rules = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-section-rule]'),
  ]
  const section = (name: string) =>
    canvasElement.querySelector<HTMLElement>(`[data-about-${name}]`)
  const hero = section('hero')
  const how = section('how')
  const costs = section('costs')
  const mission = section('mission')
  const open = section('open')
  const closing = canvasElement.querySelector<HTMLElement>('[data-final-cta]')
  const groups = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-about-steps]'),
  ]
  const steps = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-about-step]'),
  ]
  const numbers = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-about-step-number]'),
  ]
  const costPoints = [
    ...canvasElement.querySelectorAll<HTMLElement>('[data-about-cost]'),
  ]
  if (
    !rails ||
    !frame ||
    !hero ||
    !how ||
    !costs ||
    !mission ||
    !open ||
    !closing
  ) {
    throw new Error('The page is missing its frame or a section')
  }
  return {
    rails,
    frame,
    rules,
    hero,
    how,
    costs,
    mission,
    open,
    closing,
    groups,
    steps,
    numbers,
    costPoints,
  }
}

/** Every element in the frame. */
function everyNode(root: HTMLElement) {
  return [root, ...root.querySelectorAll<HTMLElement>('*')]
}

/**
 * Desktop (1366), signed out: the white page in the marketing frame. A rail
 * down each side of the page column and a full-width rule between the five
 * sections; the title is the one h1; the sections are landmarks named by their
 * headings, the step groups and cost points are h3s. The steps are hairline
 * rows with neutral Geist Mono numbers; the closing buttons go through sign-up
 * first. Green is the group icons and the closing Post a task pill only.
 */
export const Guest: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const {
      rails,
      frame,
      rules,
      hero,
      how,
      costs,
      mission,
      open,
      closing,
      groups,
      steps,
      numbers,
      costPoints,
    } = parts(canvasElement)

    // One h1; each section is a landmark named by its heading; the step
    // groups and the cost points are h3s.
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'About Slashie' }),
    ).toBeVisible()
    await expect(
      canvas
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      copy.how.heading,
      copy.costs.heading,
      copy.mission.heading,
      copy.open.heading,
      copy.closing.heading,
    ])
    await expect(canvas.getByRole('region', { name: copy.hero.heading })).toBe(
      hero,
    )
    await expect(canvas.getByRole('region', { name: copy.how.heading })).toBe(
      how,
    )
    await expect(canvas.getByRole('region', { name: copy.costs.heading })).toBe(
      costs,
    )
    await expect(
      canvas.getByRole('region', { name: copy.mission.heading }),
    ).toBe(mission)
    await expect(canvas.getByRole('region', { name: copy.open.heading })).toBe(
      open,
    )
    await expect(
      canvas.getByRole('region', { name: copy.closing.heading }),
    ).toBe(closing)
    await expect(
      canvas
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual([
      copy.how.customers.title,
      copy.how.workers.title,
      ...copy.costs.points.map((point) => point.title),
    ])
    await expect(frame.textContent).not.toContain(EM_DASH)

    // White page, left-aligned heads, 500-weight headings.
    await expect(getComputedStyle(frame).backgroundColor).toBe(WHITE)
    for (const heading of canvas.getAllByRole('heading', { level: 2 })) {
      await expect(Number(getComputedStyle(heading).fontWeight)).toBe(500)
    }
    for (const name of [copy.how.heading, copy.costs.heading]) {
      await expect(
        getComputedStyle(canvas.getByRole('heading', { level: 2, name }))
          .textAlign,
      ).toMatch(/^(start|left)$/)
    }
    await expect(
      getComputedStyle(
        canvas.getByRole('heading', { level: 1, name: 'About Slashie' }),
      ).fontSize,
    ).toBe('56px')

    // The rails bound the page column; the rules run edge to edge between
    // the five sections (four of them), and nowhere else.
    await expect(getComputedStyle(rails).display).toBe('block')
    const column = rails.firstElementChild as HTMLElement
    const edge = getComputedStyle(column)
    for (const side of ['Left', 'Right'] as const) {
      await expect(edge[`border${side}Width`]).toBe('1px')
      await expect(edge[`border${side}Color`]).toBe(BORDER_DEFAULT)
    }
    await expect(box(column).width).toBe(Math.min(box(frame).width, PAGE_PX))
    await expect(rules).toHaveLength(4)
    for (const rule of rules) {
      await expect(box(rule).width).toBe(box(frame).width)
      await expect(box(rule).height).toBe(1)
      await expect(getComputedStyle(rule).backgroundColor).toBe(BORDER_DEFAULT)
    }
    const [r1, r2, r3, r4] = rules as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ]
    await expect(box(r1).top).toBeGreaterThanOrEqual(box(hero).bottom - 1)
    await expect(box(r1).bottom).toBeLessThanOrEqual(box(how).top + 1)
    await expect(box(r2).top).toBeGreaterThanOrEqual(box(how).bottom - 1)
    await expect(box(r2).bottom).toBeLessThanOrEqual(box(costs).top + 1)
    await expect(box(r3).top).toBeGreaterThanOrEqual(box(costs).bottom - 1)
    await expect(box(r4).top).toBeGreaterThanOrEqual(box(open).bottom - 1)
    await expect(box(r4).bottom).toBeLessThanOrEqual(box(closing).top + 1)
    // The rhythm: 128px above and below each section's content.
    for (const section of [hero, how, costs, closing]) {
      await expect(getComputedStyle(section).paddingTop).toBe('128px')
      await expect(getComputedStyle(section).paddingBottom).toBe('128px')
    }

    // The two step groups sit side by side at one top, in the page column;
    // each name is an eyebrow (12px caps, 500, +0.08em, `text.subtle`) over
    // hairline rows; the group icons are green 600.
    await expect(groups).toHaveLength(2)
    const [customers, workers] = groups as [HTMLElement, HTMLElement]
    await expect(box(customers).top).toBe(box(workers).top)
    await expect(box(workers).left).toBeGreaterThan(box(customers).right)
    await expect(box(customers).left).toBe(
      box(canvas.getByRole('heading', { level: 2, name: copy.how.heading }))
        .left,
    )
    for (const [group, title] of [
      [customers, copy.how.customers.title],
      [workers, copy.how.workers.title],
    ] as const) {
      const label = within(group).getByRole('heading', {
        level: 3,
        name: title,
      })
      const style = getComputedStyle(label)
      await expect(style.fontSize).toBe('12px')
      await expect(Number(style.fontWeight)).toBe(500)
      await expect(style.textTransform).toBe('uppercase')
      await expect(style.letterSpacing).toBe('0.96px')
      await expect(style.color).toBe(TEXT_SUBTLE)
      const icon = label.parentElement?.querySelector<HTMLElement>(
        'span[aria-hidden="true"]',
      ) as HTMLElement
      await expect(getComputedStyle(icon).color).toBe(GREEN_600)
    }

    // The steps: hairline rows, the last closing the list; the number in
    // Geist Mono 12 in `text.subtle`, neutral and never green; the step in ink.
    await expect(steps).toHaveLength(6)
    await expect(numbers.map((number) => number.textContent)).toEqual([
      '01',
      '02',
      '03',
      '01',
      '02',
      '03',
    ])
    for (const step of steps) {
      const style = getComputedStyle(step)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
      await expect(style.borderTopLeftRadius).toBe('0px')
      await expect(style.backgroundColor).not.toBe(WHITE)
    }
    for (const index of [2, 5]) {
      await expect(
        getComputedStyle(steps[index] as HTMLElement).borderBottomWidth,
      ).toBe('1px')
    }
    for (const number of numbers) {
      const style = getComputedStyle(number)
      await expect(style.fontFamily.toLowerCase()).toContain('mono')
      await expect(style.fontSize).toBe('12px')
      await expect(Number(style.fontWeight)).toBe(500)
      await expect(style.fontVariantNumeric).toContain('tabular-nums')
      await expect(style.color).toBe(TEXT_SUBTLE)
      // A plain figure: no disc behind it.
      await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)')
      await expect(number).toHaveAttribute('aria-hidden', 'true')
    }
    for (const text of [
      ...copy.how.customers.steps,
      ...copy.how.workers.steps,
    ]) {
      await expect(getComputedStyle(canvas.getByText(text)).color).toBe(INK)
    }

    // The cost points: three hairline-topped columns at one top, each an h3
    // at 18/500 over a muted line; the pricing link goes to /pricing.
    await expect(costPoints).toHaveLength(3)
    const [a, b, c] = costPoints as [HTMLElement, HTMLElement, HTMLElement]
    await expect(box(a).top).toBe(box(b).top)
    await expect(box(b).top).toBe(box(c).top)
    await expect(box(b).left).toBeGreaterThan(box(a).right)
    await expect(box(c).left).toBeGreaterThan(box(b).right)
    for (const [point, content] of costPoints.map(
      (node, index) => [node, copy.costs.points[index]] as const,
    )) {
      const style = getComputedStyle(point)
      await expect(style.borderTopWidth).toBe('1px')
      await expect(style.borderTopColor).toBe(BORDER_DEFAULT)
      await expect(style.borderBottomWidth).toBe('0px')
      const title = within(point).getByRole('heading', { level: 3 })
      await expect(getComputedStyle(title).fontSize).toBe('18px')
      await expect(Number(getComputedStyle(title).fontWeight)).toBe(500)
      const body = within(point).getByText(content.body)
      await expect(getComputedStyle(body).color).toBe(TEXT_MUTED)
      await expect(getComputedStyle(body).fontSize).toBe('14px')
    }
    const pricing = canvas.getByRole('link', { name: copy.costs.pricingLink })
    await expect(pricing).toHaveAttribute('href', '/pricing')
    await expect(box(pricing).top).toBeGreaterThan(box(a).bottom)
    // Close to the points, not a section's gap away.
    await expect(box(pricing).top - box(a).bottom).toBeLessThan(64)

    // The mission and the open source note sit side by side at one top, each
    // head a left-aligned h2 at the frame's size; the two buttons are outline.
    await expect(box(mission).top).toBe(box(open).top)
    await expect(box(open).left).toBeGreaterThan(box(mission).right)
    const github = canvas.getByRole('link', {
      name: 'View the code on GitHub (opens in a new tab)',
    })
    const linkedin = canvas.getByRole('link', {
      name: 'Follow Slashie on LinkedIn (opens in a new tab)',
    })
    await expect(github).toHaveAttribute('target', '_blank')
    await expect(github).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(linkedin).toHaveAttribute('target', '_blank')
    for (const button of [github, linkedin]) {
      const style = getComputedStyle(button)
      await expect(style.backgroundColor).toBe(WHITE)
      await expect(style.color).toBe(INK)
      await expect(box(button).top).toBeGreaterThan(box(open).top)
    }

    // The closing band: Post a task, then Become a worker, through sign-up.
    await expect(closingLink(canvasElement, 'Post a task')).toHaveAttribute(
      'href',
      '/register?next=%2Ftasks%2Fcreate',
    )
    await expect(closingLink(canvasElement, 'Become a worker')).toHaveAttribute(
      'href',
      '/register?next=%2Fworker%2Fsetup',
    )

    // Green does a job or stays out: the one green fill on the page is the
    // closing Post a task pill; no green text; no weight above 600.
    const fills = everyNode(frame).filter(
      (node) => getComputedStyle(node).backgroundColor === GREEN_400,
    )
    await expect(fills).toEqual([closingLink(canvasElement, 'Post a task')])
    for (const node of everyNode(frame)) {
      const style = getComputedStyle(node)
      await expect(style.color).not.toBe(GREEN_400)
      await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
    }

    // Inside the page column: no sideways scroll.
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Has a session: post straight away, or browse tasks nearby. */
export const SignedIn: Story = {
  args: { view: 'signedIn' },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(closingLink(canvasElement, 'Post a task')).toHaveAttribute(
      'href',
      '/tasks/create',
    )
    await expect(closingLink(canvasElement, 'Browse tasks')).toHaveAttribute(
      'href',
      '/search',
    )
  },
}

/**
 * A tablet (834px): the rails are gone, the two step groups and the two
 * closing sections stay side by side, the cost points in three columns.
 */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { rails, rules, groups, costPoints, mission, open, hero } =
      parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(4)
    await expect(getComputedStyle(hero).paddingTop).toBe('80px')
    const [customers, workers] = groups as [HTMLElement, HTMLElement]
    await expect(box(customers).top).toBe(box(workers).top)
    await expect(box(workers).left).toBeGreaterThan(box(customers).right)
    const [a, b, c] = costPoints as [HTMLElement, HTMLElement, HTMLElement]
    await expect(box(a).top).toBe(box(b).top)
    await expect(box(b).top).toBe(box(c).top)
    await expect(box(mission).top).toBe(box(open).top)
    await expect(box(open).left).toBeGreaterThan(box(mission).right)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Phone width (320px, the narrowest): one column in reading order, no rails,
 * 56px sections, the title at 44px, the steps and the cost points stacked as
 * hairline rows (the last closing its list), inside the page's gutters.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const {
      rails,
      rules,
      hero,
      how,
      groups,
      steps,
      costPoints,
      mission,
      open,
    } = parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(4)
    for (const section of [hero, how]) {
      await expect(getComputedStyle(section).paddingTop).toBe('56px')
    }
    await expect(
      getComputedStyle(canvas.getByRole('heading', { level: 1 })).fontSize,
    ).toBe('44px')
    const [customers, workers] = groups as [HTMLElement, HTMLElement]
    await expect(box(workers).top).toBeGreaterThanOrEqual(box(customers).bottom)
    await expect(box(workers).left).toBe(box(customers).left)
    await expect(box(customers).left).toBeGreaterThanOrEqual(16)
    await expect(box(customers).right).toBeLessThanOrEqual(
      canvasElement.clientWidth - 16,
    )
    for (const [first, second] of [
      [steps[0], steps[1]],
      [costPoints[0], costPoints[1]],
      [costPoints[1], costPoints[2]],
    ] as const) {
      await expect(box(second as HTMLElement).top).toBeGreaterThanOrEqual(
        box(first as HTMLElement).bottom - 1,
      )
    }
    await expect(
      getComputedStyle(costPoints[0] as HTMLElement).borderBottomWidth,
    ).toBe('0px')
    await expect(
      getComputedStyle(costPoints[2] as HTMLElement).borderBottomWidth,
    ).toBe('1px')
    await expect(box(open).top).toBeGreaterThanOrEqual(box(mission).bottom)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/** Traditional Chinese copy; closing links keep the zh-hk prefix. */
export const TraditionalChinese: Story = {
  args: {
    copy: messages.zh_hk,
    ctas: marketingMessages.zh_hk.common.ctas,
    locale: 'zh-hk',
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: '關於 Slashie' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('heading', {
        level: 3,
        name: messages.zh_hk.how.workers.title,
      }),
    ).toBeInTheDocument()
    await expect(closingLink(canvasElement, '發布任務')).toHaveAttribute(
      'href',
      '/zh-hk/register?next=%2Ftasks%2Fcreate',
    )
  },
}

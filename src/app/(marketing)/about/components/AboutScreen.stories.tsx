import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import marketingMessages from '@/app/(marketing)/i11n.json'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'

import { expectMarketingPage } from '../../components/layout/marketingLines.testing'

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
    phone: marketingMessages.en.landing.phone,
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

/**
 * The hero rises in like Home's (a CSS animation), and the snippets play once
 * scrolled into view: wait for what a check looks at to be shown.
 */
async function shown(element: HTMLElement) {
  element.scrollIntoView({ block: 'center' })
  await waitFor(() => expect(element).toBeVisible(), { timeout: 4000 })
  return element
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
  const map = section('map')
  const mapCard = section('map-card')
  const how = section('how')
  const costs = section('costs')
  const mission = section('mission')
  const open = section('open')
  const closing = canvasElement.querySelector<HTMLElement>('[data-final-cta]')
  const all = (selector: string) => [
    ...canvasElement.querySelectorAll<HTMLElement>(selector),
  ]
  if (
    !rails ||
    !frame ||
    !hero ||
    !map ||
    !mapCard ||
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
    map,
    mapCard,
    how,
    costs,
    mission,
    open,
    closing,
    pins: all('[data-about-pin]'),
    groups: all('[data-about-steps]'),
    steps: all('[data-about-step]'),
    numbers: all('[data-about-step-number]'),
    costPoints: all('[data-about-cost]'),
  }
}

/** Every element in the frame. */
function everyNode(root: HTMLElement) {
  return [root, ...root.querySelectorAll<HTMLElement>('*')]
}

const phone = marketingMessages.en.landing.phone

/**
 * Desktop (1366), signed out, redesigned to follow Home (FE-554): the white
 * page in the marketing frame, a rail down each side of the page column and
 * a full-width rule between the five sections. Home's centred hero (the one
 * h1) over the map scene; how it works as two cells, each its steps over a
 * live snippet; the costs as three cells; the mission and the open source
 * note as two cells; Home's closing band. The sections are landmarks named by
 * their headings, the step groups and cost points are h3s. The closing
 * buttons go through sign-up first. The one green fill outside the map is the
 * closing Post a task pill.
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
      map,
      mapCard,
      how,
      costs,
      mission,
      open,
      closing,
      pins,
      groups,
      steps,
      numbers,
      costPoints,
    } = parts(canvasElement)

    // One h1, centred, naming the hero; each section is a landmark named by
    // its heading; the step groups and the cost points are h3s.
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    const h1 = canvas.getByRole('heading', { level: 1, name: 'About Slashie' })
    await shown(h1)
    await expect(getComputedStyle(h1).textAlign).toBe('center')
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
    for (const [name, element] of [
      [copy.hero.heading, hero],
      [copy.how.heading, how],
      [copy.costs.heading, costs],
      [copy.mission.heading, mission],
      [copy.open.heading, open],
      [copy.closing.heading, closing],
    ] as const) {
      await expect(canvas.getByRole('region', { name })).toBe(element)
    }
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
    await expect(getComputedStyle(frame).backgroundColor).toBe(WHITE)
    for (const heading of canvas.getAllByRole('heading', { level: 2 })) {
      await expect(Number(getComputedStyle(heading).fontWeight)).toBe(500)
    }

    // The map scene, under the copy: the landing's sketch with nearby tasks'
    // price pins (decoration), one selected with how far it is, and its card
    // beside it, which is what a screen reader reads.
    await expect(box(map).top).toBeGreaterThan(box(h1).bottom)
    await expect(pins.map((pin) => pin.dataset.aboutPin)).toEqual([
      'move',
      'wardrobe',
      'paint',
      'clean',
      'hedge',
    ])
    await shown(map)
    for (const pin of pins) {
      await waitFor(() => expect(pin).toBeVisible(), { timeout: 4000 })
    }
    await expect(pins[0]?.parentElement).toHaveAttribute('aria-hidden', 'true')
    const selected = pins[4] as HTMLElement
    await expect(selected).toHaveTextContent(phone.tasks.hedge.distance)
    await expect(mapCard).toHaveTextContent(phone.tasks.hedge.title)
    await expect(mapCard).toHaveTextContent('3 quotes')
    await expect(box(mapCard).left).toBeGreaterThan(box(selected).right)
    for (const inner of [mapCard, ...pins]) {
      await expect(box(inner).left).toBeGreaterThanOrEqual(box(map).left)
      await expect(box(inner).right).toBeLessThanOrEqual(box(map).right)
      await expect(box(inner).top).toBeGreaterThanOrEqual(box(map).top)
      await expect(box(inner).bottom).toBeLessThanOrEqual(box(map).bottom)
    }

    // The rails bound the page column; four rules run edge to edge between
    // the five sections, and nowhere else.
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
    const order = [hero, how, costs, mission, closing]
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i] as HTMLElement
      await expect(box(rule).top).toBeGreaterThanOrEqual(
        box(order[i] as HTMLElement).bottom - 1,
      )
      await expect(box(rule).bottom).toBeLessThanOrEqual(
        box(order[i + 1] as HTMLElement).top + 1,
      )
    }
    await expect(getComputedStyle(closing).paddingTop).toBe('128px')

    // How it works: two cells side by side, divided by a hairline; each
    // group's name is an eyebrow (12px caps, 500, +0.08em, `text.subtle`)
    // with a green 600 icon, over its steps; their snippets start on one line.
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
    const howCells = [...how.querySelectorAll<HTMLElement>('[data-about-cell]')]
    await expect(howCells).toHaveLength(2)
    await expect(
      getComputedStyle(howCells[1] as HTMLElement).borderLeftWidth,
    ).toBe('1px')
    const quotes = canvas.getByRole('figure', {
      name: copy.how.customers.title,
    })
    const sendQuote = canvas.getByRole('figure', {
      name: copy.how.workers.title,
    })
    await expect(box(quotes).top).toBe(box(sendQuote).top)
    await expect(box(quotes).top).toBeGreaterThan(box(customers).bottom)
    await shown(within(sendQuote).getByText(phone.worker.flow.sentHeadline))
    await expect(sendQuote).toHaveTextContent(phone.tasks.wardrobe.title)
    await expect(sendQuote).toHaveTextContent(phone.worker.flow.slot)

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
      await expect(style.fontVariantNumeric).toContain('tabular-nums')
      await expect(style.color).toBe(TEXT_SUBTLE)
      await expect(number).toHaveAttribute('aria-hidden', 'true')
    }
    for (const text of [
      ...copy.how.customers.steps,
      ...copy.how.workers.steps,
    ]) {
      await expect(getComputedStyle(canvas.getByText(text)).color).toBe(INK)
    }

    // The costs: a list of three cells at one top, divided by hairlines,
    // each a green 600 icon, an h3 at 18/500 and a muted 14px line. See
    // pricing sits beside the head and goes to /pricing.
    await expect(costPoints).toHaveLength(3)
    await expect(costPoints.every((point) => point.tagName === 'LI')).toBe(true)
    const [a, b, c] = costPoints as [HTMLElement, HTMLElement, HTMLElement]
    await expect(box(a).top).toBe(box(b).top)
    await expect(box(b).top).toBe(box(c).top)
    for (const point of [b, c]) {
      await expect(getComputedStyle(point).borderLeftWidth).toBe('1px')
    }
    for (const [point, content] of costPoints.map(
      (node, index) => [node, copy.costs.points[index]] as const,
    )) {
      const title = within(point).getByRole('heading', { level: 3 })
      await expect(getComputedStyle(title).fontSize).toBe('18px')
      await expect(Number(getComputedStyle(title).fontWeight)).toBe(500)
      const body = within(point).getByText(content?.body ?? '')
      await expect(getComputedStyle(body).color).toBe(TEXT_MUTED)
      await expect(getComputedStyle(body).fontSize).toBe('14px')
      const icon = point.querySelector('[data-about-cost-icon]') as HTMLElement
      await expect(getComputedStyle(icon).color).toBe(GREEN_600)
    }
    const pricing = canvas.getByRole('link', { name: copy.costs.pricingLink })
    await expect(pricing).toHaveAttribute('href', '/pricing')
    await expect(box(pricing).top).toBeLessThan(box(a).top)
    await expect(costs.querySelector('[data-page-cell]')).toContainElement(
      pricing,
    )
    await expect(box(pricing).right).toBeGreaterThan(box(c).left)

    // The mission and the open source note: two cells at one top, divided by
    // a hairline; the two buttons are outline and open a new tab.
    await expect(box(mission).top).toBe(box(open).top)
    await expect(box(open).left).toBeGreaterThan(box(mission).right - 1)
    await expect(getComputedStyle(open).borderLeftWidth).toBe('1px')
    const github = canvas.getByRole('link', {
      name: 'View the code on GitHub (opens in a new tab)',
    })
    const linkedin = canvas.getByRole('link', {
      name: 'Follow Slashie on LinkedIn (opens in a new tab)',
    })
    for (const button of [github, linkedin]) {
      await expect(button).toHaveAttribute('target', '_blank')
      await expect(button).toHaveAttribute('rel', 'noopener noreferrer')
      await expect(getComputedStyle(button).backgroundColor).toBe(WHITE)
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

    // Green does a job or stays out: outside the map (where the pins' dots
    // mark places), the one green fill is the closing Post a task pill; no
    // green text; no weight above 600.
    const fills = everyNode(frame).filter(
      (node) =>
        getComputedStyle(node).backgroundColor === GREEN_400 &&
        !node.closest('[data-about-map]'),
    )
    await expect(fills).toEqual([closingLink(canvasElement, 'Post a task')])
    for (const node of everyNode(frame)) {
      const style = getComputedStyle(node)
      await expect(style.color).not.toBe(GREEN_400)
      await expect(Number(style.fontWeight)).toBeLessThanOrEqual(600)
    }

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
 * A tablet (834px): the rails are gone; the map card stays beside its pin;
 * the two how-it-works cells, the three cost cells and the two closing cells
 * stay side by side.
 */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet', isRotated: false } },
  play: async ({ canvasElement }) => {
    const { rails, rules, groups, costPoints, mission, open, map, mapCard } =
      parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(4)
    await expect(box(mapCard).right).toBeLessThanOrEqual(box(map).right)
    const [customers, workers] = groups as [HTMLElement, HTMLElement]
    await expect(box(customers).top).toBe(box(workers).top)
    await expect(box(workers).left).toBeGreaterThan(box(customers).right)
    const [a, b, c] = costPoints as [HTMLElement, HTMLElement, HTMLElement]
    await expect(box(a).top).toBe(box(b).top)
    await expect(box(b).top).toBe(box(c).top)
    await expect(box(mission).top).toBe(box(open).top)
    await expect(box(open).left).toBeGreaterThan(box(mission).right - 1)
    const root = canvasElement.ownerDocument.documentElement
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth)
  },
}

/**
 * Phone width (320px, the narrowest): one column in reading order, no rails.
 * The map keeps three pins and its card at its foot, inside the scene; the
 * cells stack with a hairline between them (the cost points 32px from it,
 * short as they are); everything inside the page's gutters.
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    const {
      rails,
      rules,
      map,
      mapCard,
      pins,
      how,
      groups,
      costPoints,
      mission,
      open,
    } = parts(canvasElement)
    await expect(getComputedStyle(rails).display).toBe('none')
    await expect(rules).toHaveLength(4)
    const visible = pins.filter(
      (pin) => getComputedStyle(pin).display !== 'none',
    )
    await expect(visible.map((pin) => pin.dataset.aboutPin)).toEqual([
      'move',
      'clean',
      'hedge',
    ])
    await expect(box(mapCard).bottom).toBeLessThanOrEqual(box(map).bottom)
    await expect(box(mapCard).left).toBeGreaterThan(box(map).left)
    for (const pin of visible) {
      await expect(box(pin).bottom).toBeLessThanOrEqual(box(mapCard).top)
    }
    await expect(how.querySelector('[data-page-cell]')).not.toBeNull()
    const [customers, workers] = groups as [HTMLElement, HTMLElement]
    await expect(box(workers).top).toBeGreaterThanOrEqual(box(customers).bottom)
    await expect(box(workers).left).toBe(box(customers).left)
    await expect(box(customers).left).toBeGreaterThanOrEqual(16)
    await expect(box(customers).right).toBeLessThanOrEqual(
      canvasElement.clientWidth - 16,
    )
    for (const [first, second] of [
      [costPoints[0], costPoints[1]],
      [costPoints[1], costPoints[2]],
    ] as const) {
      await expect(box(second as HTMLElement).top).toBeGreaterThanOrEqual(
        box(first as HTMLElement).bottom - 1,
      )
      await expect(getComputedStyle(second as HTMLElement).borderTopWidth).toBe(
        '1px',
      )
      await expect(getComputedStyle(second as HTMLElement).paddingTop).toBe(
        '32px',
      )
    }
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
    phone: marketingMessages.zh_hk.landing.phone,
    locale: 'zh-hk',
  },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shown(canvas.getByRole('heading', { level: 1, name: '關於 Slashie' }))
    await expect(
      canvas.getByRole('heading', {
        level: 3,
        name: messages.zh_hk.how.workers.title,
      }),
    ).toBeInTheDocument()
    await expect(
      closingLink(canvasElement, marketingMessages.zh_hk.common.ctas.postTask),
    ).toHaveAttribute('href', '/zh-hk/register?next=%2Ftasks%2Fcreate')
    await expect(canvasElement.textContent).not.toContain('師傅')
    await expect(canvasElement.textContent).not.toContain(EM_DASH)
  },
}

/** R1, R2, R5 (FE-493): the sections and the cells on the logo and menu lines (the h1 is centred, FE-554), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 390 (phone). */
export const PageLines390: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 390, {
      header: false,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493): the sections and the cells on the logo and menu lines (the h1 is centred, FE-554), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 1024 (tablet). */
export const PageLines1024: Story = {
  ...viewportAt(1024),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1024, {
      header: false,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493): the sections and the cells on the logo and menu lines (the h1 is centred, FE-554), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 1366 (laptop). */
export const PageLines1366: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1366, {
      header: false,
      centredTitle: true,
    })
  },
}

/** R1, R2, R5 (FE-493): the sections and the cells on the logo and menu lines (the h1 is centred, FE-554), the rails on the container edge from lg (32px outside the lines), the rules edge to edge at 1920 (wide desktop). */
export const PageLines1920: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    expectMarketingPage(canvasElement, 1920, {
      header: false,
      centredTitle: true,
    })
  },
}

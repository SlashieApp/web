import { Box, Link as ChakraLink, Text } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'
import { LuEllipsisVertical } from 'react-icons/lu'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { IconButton } from '../IconButton/IconButton'
import {
  HEADER_ICON_BUTTON,
  HEADER_OVERLAY_BUTTON,
  StickyHeader,
  StickyHeaderTitle,
} from './StickyHeader'
import {
  BAR_H,
  BAR_TITLE_INSET,
  BAR_TITLE_INSET_CHIP,
  BUTTON_OVERHANG,
  GLYPH_PX as HEADER_GLYPH_PX,
  TITLE_GAP,
  collapseProgress,
  titlePosition,
  titleScale,
} from './headerCollapse'

const meta = {
  title: 'UI/StickyHeader',
  component: StickyHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Account',
    description: 'Email, phone and sign-in. How others see you is in Profile.',
    backAriaLabel: 'Go back',
    onBack: () => {},
  },
} satisfies Meta<typeof StickyHeader>

export default meta
type Story = StoryObj<typeof meta>

// ------------------------------------------------------------- helpers

/** The pane's side gutter: the page column (and so the bar's row) starts here. */
const GUTTER = 24

/** Story-only scroll pane, as the app shell's `main`; `scrollTop` starts it scrolled. */
function Pane({
  scrollTop = 0,
  bg = 'bg.subtle',
  children,
}: {
  scrollTop?: number
  bg?: 'bg.subtle' | 'bg.canvas' | 'transparent'
  children: ReactNode
}) {
  return (
    <Box
      ref={(node: HTMLDivElement | null) => {
        if (!node || !scrollTop) return
        requestAnimationFrame(() => {
          node.scrollTop = scrollTop
        })
      }}
      data-pane=""
      h="480px"
      overflowY="auto"
      overflowX="clip"
      bg={bg}
      px={`${GUTTER}px`}
    >
      {children}
    </Box>
  )
}

/** The page under the header: some lines, with a link to tab to. */
function PageBody() {
  return (
    <Box pb={10}>
      <ChakraLink href="#page" color="text.link">
        A link in the page
      </ChakraLink>
      <Text color="text.muted" h="1400px" pt={4}>
        Page content
      </Text>
    </Box>
  )
}

const withPane =
  (scrollTop = 0): Decorator =>
  (Story) => (
    <Pane scrollTop={scrollTop}>
      <Story />
    </Pane>
  )

const part = (root: HTMLElement, name: string) => {
  const el = root.querySelector<HTMLElement>(`[data-sticky-header-${name}]`)
  if (!el) throw new Error(`no ${name}`)
  return el
}

/** Two animation frames: the scroll listener writes in the frame after a scroll. */
const settle = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )

const pane = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-pane]') as HTMLElement

async function scrollTo(root: HTMLElement, top: number) {
  pane(root).scrollTop = top
  await settle()
}

const near = (actual: number, expected: number, within = 1.5) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(within)

const heading = (root: HTMLElement) => within(root).getByRole('heading')

// ------------------------------------------------------------- stories

/** Top of the page: Back alone in the bar, the 34px h1 under it, the description under that. */
export const Top: Story = {
  decorators: [withPane()],
  render: (args) => (
    <StickyHeader {...args}>
      <PageBody />
    </StickyHeader>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: args.title }),
    ).toBeVisible()
    await expect(canvas.getAllByRole('heading')).toHaveLength(1)
    const back = canvas.getByRole('button', { name: 'Go back' })
    await expect(back).toBeVisible()
    const bar = part(canvasElement, 'bar')
    const h1 = heading(canvasElement)
    near(bar.getBoundingClientRect().height, BAR_H)
    // The big title: 34px, bold, 8px under the bar, on the content's left edge.
    const style = getComputedStyle(h1)
    expect(style.fontSize).toBe('34px')
    expect(style.fontWeight).toBe('700')
    near(Number.parseFloat(style.lineHeight), 34 * 1.2)
    near(
      h1.getBoundingClientRect().top,
      bar.getBoundingClientRect().bottom + TITLE_GAP,
    )
    near(
      h1.getBoundingClientRect().left,
      pane(canvasElement).getBoundingClientRect().left + GUTTER,
    )
    // Back: a 44px box with its 24px glyph on the content's left edge.
    const box = back.getBoundingClientRect()
    near(box.width, 44)
    near(box.height, 44)
    near(box.left, h1.getBoundingClientRect().left - BUTTON_OVERHANG)
    const glyph = back.querySelector('svg') as SVGElement
    near(glyph.getBoundingClientRect().width, HEADER_GLYPH_PX)
    near(glyph.getBoundingClientRect().left, h1.getBoundingClientRect().left)
    // The bar's copy is hidden from screen readers and from sight.
    const barTitle = part(canvasElement, 'bar-title')
    expect(barTitle.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(getComputedStyle(barTitle).opacity).toBe('0')
    // No rule or shadow under the bar.
    const bg = part(canvasElement, 'bar-bg')
    expect(getComputedStyle(bg).boxShadow).toBe('none')
    expect(getComputedStyle(bg).borderBottomWidth).toBe('0px')
  },
}

/**
 * 24px down: halfway. The title has moved up with the page and drifted right,
 * and is at 26px (halfway between 34 and 18). The bar's copy has not started.
 */
export const PartWay: Story = {
  ...Top,
  decorators: [withPane(24)],
  play: async ({ canvasElement, args }) => {
    await settle()
    await scrollTo(canvasElement, 24)
    const bar = part(canvasElement, 'bar')
    const moving = part(canvasElement, 'traveller')
    const left = pane(canvasElement).getBoundingClientRect().left + GUTTER
    const rest = { x: left, y: bar.getBoundingClientRect().bottom + TITLE_GAP }
    const p = collapseProgress(24, 0)
    const expected = titlePosition(p, rest, {
      contentLeft: left,
      rowTop: bar.getBoundingClientRect().top,
    })
    const box = moving.getBoundingClientRect()
    near(box.left, expected.x)
    near(box.top, expected.y)
    const h1Box = heading(canvasElement).getBoundingClientRect()
    near(box.width, h1Box.width * titleScale(p))
    // The copy wraps as the heading does, so it is as tall as it, scaled.
    near(box.height, h1Box.height * titleScale(p))
    // The page's own h1 steps aside for the moving copy; it is still the one heading.
    expect(getComputedStyle(heading(canvasElement)).opacity).toBe('0')
    expect(getComputedStyle(moving).opacity).toBe('1')
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('0')
    await expect(
      within(canvasElement).getAllByRole('heading', { name: args.title }),
    ).toHaveLength(1)
  },
}

/** Scrolled well past: the title is in the bar, one line at 18px, beside Back. */
export const Collapsed: Story = {
  ...Top,
  decorators: [withPane(400)],
  play: async ({ canvasElement }) => {
    await settle()
    await scrollTo(canvasElement, 400)
    const bar = part(canvasElement, 'bar')
    const barTitle = part(canvasElement, 'bar-title')
    // The bar stays at the top of the page.
    near(
      bar.getBoundingClientRect().top,
      pane(canvasElement).getBoundingClientRect().top,
    )
    expect(getComputedStyle(barTitle).opacity).toBe('1')
    expect(getComputedStyle(part(canvasElement, 'traveller')).opacity).toBe('0')
    const style = getComputedStyle(barTitle)
    expect(style.fontSize).toBe('18px')
    expect(style.fontWeight).toBe('600')
    expect(style.lineHeight).toBe('24px')
    // 40px in from the content's left edge, centred in the 56px row.
    const box = barTitle.getBoundingClientRect()
    const left = pane(canvasElement).getBoundingClientRect().left + GUTTER
    near(box.left, left + BAR_TITLE_INSET)
    near(box.top + box.height / 2, bar.getBoundingClientRect().top + BAR_H / 2)
    // Back is still there, on the bar's row.
    const back = within(canvasElement).getByRole('button', { name: 'Go back' })
    near(back.getBoundingClientRect().top, bar.getBoundingClientRect().top + 6)
    // Hidden from screen readers; the h1 is still the one heading.
    expect(barTitle.closest('[aria-hidden="true"]')).not.toBeNull()
    await expect(within(canvasElement).getAllByRole('heading')).toHaveLength(1)
  },
}

/** Scrolling back up reverses it: top again, the title back under the bar. */
export const BackUp: Story = {
  ...Top,
  decorators: [withPane(400)],
  play: async ({ canvasElement }) => {
    await settle()
    await scrollTo(canvasElement, 400)
    await scrollTo(canvasElement, 0)
    const bar = part(canvasElement, 'bar')
    near(
      heading(canvasElement).getBoundingClientRect().top,
      bar.getBoundingClientRect().bottom + TITLE_GAP,
    )
    expect(getComputedStyle(heading(canvasElement)).opacity).toBe('1')
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('0')
    expect(getComputedStyle(part(canvasElement, 'traveller')).opacity).toBe('0')
  },
}

const LONG_TITLE =
  'Replace the cracked bathroom tiles and re-grout the shower tray in the upstairs flat before the end of the month'

/**
 * A long title wraps under the bar in a phone-width column (`contentMaxW`),
 * and ends as one line with an ellipsis in it.
 */
export const LongWrappingTitle: Story = {
  args: { title: LONG_TITLE, description: undefined, contentMaxW: '22rem' },
  decorators: [withPane()],
  render: Top.render,
  play: async ({ canvasElement, args }) => {
    const h1 = within(canvasElement).getByRole('heading', {
      level: 1,
      name: args.title,
    })
    // Several lines at the top, in the column.
    expect(h1.getBoundingClientRect().height).toBeGreaterThan(34 * 1.2 * 3)
    near(h1.getBoundingClientRect().width, 22 * 16, 1)
    // The moving copy wraps on the same lines as the heading.
    await scrollTo(canvasElement, 12)
    const copy = part(canvasElement, 'traveller').getBoundingClientRect()
    near(
      copy.height,
      h1.getBoundingClientRect().height * titleScale(collapseProgress(12, 0)),
    )
    await scrollTo(canvasElement, 400)
    const barTitle = part(canvasElement, 'bar-title')
    expect(getComputedStyle(barTitle).textOverflow).toBe('ellipsis')
    expect(getComputedStyle(barTitle).whiteSpace).toBe('nowrap')
    expect(barTitle.scrollWidth).toBeGreaterThan(barTitle.clientWidth)
    near(barTitle.getBoundingClientRect().height, 24)
  },
}

/** Phone width: the title wraps in the one column. */
export const Phone: Story = {
  ...LongWrappingTitle,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: undefined,
}

/** zh-HK: the same bar with Chinese copy and a Chinese back label. */
export const ZhHk: Story = {
  args: {
    title: '服務條款',
    description: '最後更新：2026 年 7 月 8 日',
    backAriaLabel: '返回',
  },
  decorators: [withPane()],
  render: Top.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: '服務條款' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: '返回' })).toBeVisible()
    await scrollTo(canvasElement, 400)
    const barTitle = part(canvasElement, 'bar-title')
    expect(barTitle).toHaveTextContent('服務條款')
    expect(getComputedStyle(barTitle).opacity).toBe('1')
  },
}

/** Story-only: what `(prefers-reduced-motion: reduce)` reports until cleanup. */
function emulateReducedMotion(matches: boolean) {
  const original = window.matchMedia
  window.matchMedia = (query: string) => {
    const list = original.call(window, query)
    if (!/prefers-reduced-motion:\s*reduce/.test(query)) return list
    return new Proxy(list, {
      get(target, prop) {
        if (prop === 'matches') return matches
        const value = Reflect.get(target, prop)
        return typeof value === 'function' ? value.bind(target) : value
      },
    })
  }
  return () => {
    window.matchMedia = original
  }
}

/**
 * Reduced motion: nothing interpolates. The heading scrolls as any content
 * does; at 48px the bar's copy shows at once, and below that it is hidden.
 */
export const ReducedMotion: Story = {
  ...Top,
  beforeEach: () => emulateReducedMotion(true),
  play: async ({ canvasElement }) => {
    await settle()
    const h1 = heading(canvasElement)
    const bar = part(canvasElement, 'bar')
    const top = h1.getBoundingClientRect().top
    await scrollTo(canvasElement, 24)
    // Scrolled like any content: 24px up, not scaled, no moving copy.
    near(h1.getBoundingClientRect().top, top - 24)
    expect(getComputedStyle(h1).opacity).toBe('1')
    expect(h1.getBoundingClientRect().height).toBeGreaterThan(40)
    expect(getComputedStyle(part(canvasElement, 'traveller')).opacity).toBe('0')
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('0')
    await scrollTo(canvasElement, 47)
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('0')
    await scrollTo(canvasElement, 48)
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('1')
    expect(getComputedStyle(part(canvasElement, 'traveller')).opacity).toBe('0')
    near(
      bar.getBoundingClientRect().top,
      pane(canvasElement).getBoundingClientRect().top,
    )
  },
}

/** The page's own icon button on the right of the bar: the glyph's right edge on the content's right edge. */
export const WithOption: Story = {
  args: {
    option: (
      <IconButton
        type="button"
        variant="ghost"
        aria-label="Task options"
        {...HEADER_ICON_BUTTON}
      >
        <LuEllipsisVertical />
      </IconButton>
    ),
  },
  decorators: [withPane()],
  render: Top.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const option = canvas.getByRole('button', { name: 'Task options' })
    const box = option.getBoundingClientRect()
    near(box.width, 44)
    near(box.height, 44)
    const paneBox = pane(canvasElement).getBoundingClientRect()
    const glyph = option.querySelector('svg') as SVGElement
    near(glyph.getBoundingClientRect().right, paneBox.right - GUTTER)
    // Focus order follows the bar's row: Back, the option button, then the page.
    const back = canvas.getByRole('button', { name: 'Go back' })
    back.focus()
    await userEvent.tab()
    expect(document.activeElement).toBe(option)
    await userEvent.tab()
    expect(document.activeElement).toBe(
      canvas.getByRole('link', { name: 'A link in the page' }),
    )
    // Reading order the same: Back, the option button, then the big title.
    const following = (from: Element, to: Element) =>
      Boolean(
        from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_FOLLOWING,
      )
    expect(following(back, option)).toBe(true)
    expect(following(option, heading(canvasElement))).toBe(true)
    // Collapsed, the bar's copy stops 8px before the option button's box.
    await scrollTo(canvasElement, 400)
    const barTitle = part(canvasElement, 'bar-title')
    near(barTitle.getBoundingClientRect().right, box.left - 8)
  },
}

/** A long title next to the option button: the ellipsis is cut before it, not under it. */
export const LongTitleWithOption: Story = {
  args: { ...WithOption.args, title: LONG_TITLE, description: undefined },
  decorators: [withPane(400)],
  render: Top.render,
  play: async ({ canvasElement }) => {
    await settle()
    await scrollTo(canvasElement, 400)
    const option = within(canvasElement).getByRole('button', {
      name: 'Task options',
    })
    const barTitle = part(canvasElement, 'bar-title')
    expect(barTitle.getBoundingClientRect().right).toBeLessThanOrEqual(
      option.getBoundingClientRect().left - 8 + 1,
    )
  },
}

/** A bar with no title: just Back, over a page that brings its own heading. */
export const BackOnly: Story = {
  args: { title: undefined, description: undefined },
  decorators: [withPane()],
  render: (args) => (
    <StickyHeader {...args}>
      <PageBody />
    </StickyHeader>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
    expect(canvas.queryByRole('heading')).toBeNull()
    await scrollTo(canvasElement, 400)
    near(
      part(canvasElement, 'bar').getBoundingClientRect().top,
      pane(canvasElement).getBoundingClientRect().top,
    )
  },
}

/** A pane's own header above (a sticky site header): the bar sticks under it, with `stickyTop`. */
export const BelowSiteHeader: Story = {
  args: { stickyTop: '64px' },
  decorators: [withPane()],
  render: (args) => (
    <>
      <Box
        position="sticky"
        top={0}
        zIndex={20}
        h="64px"
        mx={`-${GUTTER}px`}
        bg="bg.canvas"
        borderBottomWidth="1px"
        borderColor="border.default"
      />
      <StickyHeader {...args}>
        <PageBody />
      </StickyHeader>
    </>
  ),
  play: async ({ canvasElement }) => {
    const bar = part(canvasElement, 'bar')
    const top = pane(canvasElement).getBoundingClientRect().top
    // At the top the bar is right under the site header, and the title 8px under it.
    near(bar.getBoundingClientRect().top, top + 64)
    near(
      heading(canvasElement).getBoundingClientRect().top,
      top + 64 + BAR_H + TITLE_GAP,
    )
    await scrollTo(canvasElement, 24)
    await scrollTo(canvasElement, 400)
    near(bar.getBoundingClientRect().top, top + 64)
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('1')
    // 16px into the row, level with the pinned copy's place.
    const barTitle = part(canvasElement, 'bar-title').getBoundingClientRect()
    near(barTitle.top, top + 64 + 16)
  },
}

/** A drawn map: streets, a block and a price pin, for the over-media stories. */
const MAP =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='420' viewBox='0 0 600 420'><rect width='600' height='420' fill='%23e6ece8'/><g stroke='%23ffffff' stroke-width='10' fill='none'><path d='M0 90 L600 60'/><path d='M0 250 L600 290'/><path d='M120 0 L180 420'/><path d='M400 0 L360 420'/></g><g stroke='%23d3dcd7' stroke-width='3' fill='none'><path d='M0 170 L600 180'/><path d='M270 0 L290 420'/><path d='M0 340 L600 330'/></g><rect x='200' y='110' width='110' height='70' rx='6' fill='%23cfe0d6'/><rect x='430' y='200' width='90' height='60' rx='6' fill='%23cfe0d6'/><rect x='215' y='140' width='80' height='34' rx='17' fill='%23ffffff' stroke='%2300dc82' stroke-width='3'/></svg>\")"

const MAP_H = 300

/** What task details and a public profile do: a map under the bar, the title lower down. */
function MediaPage({ title }: { title: string }) {
  return (
    <Box>
      <Box
        data-media=""
        h={`${MAP_H}px`}
        bgImage={MAP}
        backgroundSize="cover"
        backgroundPosition="center"
      />
      <Box pt={4} pb={10}>
        <StickyHeaderTitle>{title}</StickyHeaderTitle>
        <ChakraLink href="#page" color="text.link">
          A link in the page
        </ChakraLink>
        <Text color="text.muted" h="1400px" pt={4}>
          Page content
        </Text>
      </Box>
    </Box>
  )
}

const mediaOption = (
  <IconButton
    type="button"
    variant="ghost"
    aria-label="Task options"
    {...HEADER_OVERLAY_BUTTON}
  >
    <LuEllipsisVertical />
  </IconButton>
)

const MEDIA_ARGS = {
  overMedia: true,
  background: 'bg.canvas',
  title: 'Mount bookshelf on living room wall',
  description: undefined,
  option: mediaOption,
} as const

/**
 * Over a map (task details, a public profile): Back and the option button
 * float over it from the start, in the frosted overlay look, and the bar has
 * no background. The title rests lower, under the map.
 */
export const OverMap: Story = {
  args: MEDIA_ARGS,
  decorators: [withPane()],
  render: (args) => (
    <StickyHeader {...args}>
      <MediaPage title={args.title ?? ''} />
    </StickyHeader>
  ),
  play: async ({ canvasElement, args }) => {
    await settle()
    const canvas = within(canvasElement)
    const bar = part(canvasElement, 'bar')
    const map = canvasElement.querySelector('[data-media]') as HTMLElement
    // The bar is over the top of the map; the map starts at the page's top.
    near(
      map.getBoundingClientRect().top,
      pane(canvasElement).getBoundingClientRect().top,
    )
    near(bar.getBoundingClientRect().top, map.getBoundingClientRect().top)
    expect(getComputedStyle(part(canvasElement, 'bar-bg')).opacity).toBe('0')
    // Back and the option button are the frosted chips.
    const back = canvas.getByRole('button', { name: 'Go back' })
    expect(getComputedStyle(back).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    const option = canvas.getByRole('button', { name: 'Task options' })
    expect(getComputedStyle(option).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    )
    // Round 44px chips inside the margin: their outer edges are the content's,
    // and Back's glyph is centred in its chip (10px in).
    const content = pane(canvasElement).getBoundingClientRect()
    const backBox = back.getBoundingClientRect()
    near(backBox.width, 44)
    near(backBox.height, 44)
    near(backBox.left, content.left + GUTTER)
    near(option.getBoundingClientRect().right, content.right - GUTTER)
    const glyph = back.querySelector('svg') as SVGElement
    near(glyph.getBoundingClientRect().left, backBox.left + BUTTON_OVERHANG)
    // The page's one h1 is under the map.
    const h1 = canvas.getByRole('heading', { level: 1, name: args.title })
    expect(h1.getBoundingClientRect().top).toBeGreaterThan(
      map.getBoundingClientRect().bottom,
    )
    await expect(canvas.getAllByRole('heading')).toHaveLength(1)
  },
}

/**
 * Over a map, the title first scrolls up as any content does; the bar stays
 * transparent until the title reaches it, then fades to the page colour as the
 * title collapses into it.
 */
export const OverMapPartWay: Story = {
  ...OverMap,
  decorators: [withPane()],
  play: async ({ canvasElement }) => {
    await settle()
    const h1 = heading(canvasElement)
    const bar = part(canvasElement, 'bar')
    const bg = part(canvasElement, 'bar-bg')
    const rest = h1.getBoundingClientRect().top
    const start = rest - (bar.getBoundingClientRect().bottom + TITLE_GAP)
    // Before the start: transparent, nothing moving.
    await scrollTo(canvasElement, Math.round(start) - 40)
    expect(getComputedStyle(bg).opacity).toBe('0')
    expect(getComputedStyle(part(canvasElement, 'traveller')).opacity).toBe('0')
    // Halfway through its 48px.
    await scrollTo(canvasElement, Math.round(start) + 24)
    near(Number(getComputedStyle(bg).opacity), 0.5, 0.05)
    const moving = part(canvasElement, 'traveller')
    expect(getComputedStyle(moving).opacity).toBe('1')
    near(
      moving.getBoundingClientRect().top,
      bar.getBoundingClientRect().bottom + 8 - 24,
    )
    near(
      moving.getBoundingClientRect().width,
      h1.getBoundingClientRect().width * titleScale(0.5),
      2,
    )
    // It drifts right towards content left + 52, after Back's chip.
    const contentLeft =
      pane(canvasElement).getBoundingClientRect().left + GUTTER
    near(
      moving.getBoundingClientRect().left,
      titlePosition(
        0.5,
        { x: h1.getBoundingClientRect().left, y: 0 },
        { contentLeft, rowTop: 0, chips: true },
      ).x,
    )
  },
}

/** Over a map, scrolled well past: the bar is the page colour with the title in it. */
export const OverMapCollapsed: Story = {
  ...OverMap,
  decorators: [withPane(700)],
  play: async ({ canvasElement }) => {
    await settle()
    await scrollTo(canvasElement, 700)
    const bar = part(canvasElement, 'bar')
    expect(getComputedStyle(part(canvasElement, 'bar-bg')).opacity).toBe('1')
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('1')
    expect(getComputedStyle(part(canvasElement, 'traveller')).opacity).toBe('0')
    near(
      bar.getBoundingClientRect().top,
      pane(canvasElement).getBoundingClientRect().top,
    )
    // Back and the option button are still in the bar, on its row.
    const row = bar.getBoundingClientRect()
    const option = within(canvasElement)
      .getByRole('button', { name: 'Task options' })
      .getBoundingClientRect()
    near(option.top, row.top + 6)
    // The bar copy starts after Back's chip (content left + 52) and ends 8px
    // before the option chip.
    const content = pane(canvasElement).getBoundingClientRect()
    const copy = part(canvasElement, 'bar-title').getBoundingClientRect()
    near(copy.left, content.left + GUTTER + BAR_TITLE_INSET_CHIP)
    near(copy.right, option.left - 8)
  },
}

/** Over a map with no option button: the bar copy runs on to the content's right edge. */
export const OverMapNoOption: Story = {
  ...OverMap,
  args: { ...MEDIA_ARGS, option: undefined },
  decorators: [withPane(700)],
  play: async ({ canvasElement }) => {
    await settle()
    await scrollTo(canvasElement, 700)
    const content = pane(canvasElement).getBoundingClientRect()
    const back = within(canvasElement)
      .getByRole('button', { name: 'Go back' })
      .getBoundingClientRect()
    near(back.left, content.left + GUTTER)
    const copy = part(canvasElement, 'bar-title').getBoundingClientRect()
    near(copy.left, content.left + GUTTER + BAR_TITLE_INSET_CHIP)
    near(copy.right, content.right - GUTTER)
  },
}

/** Over a map with reduced motion: the bar changes at once, 48px after the title reaches it. */
export const OverMapReducedMotion: Story = {
  ...OverMap,
  beforeEach: () => emulateReducedMotion(true),
  play: async ({ canvasElement }) => {
    await settle()
    const h1 = heading(canvasElement)
    const bar = part(canvasElement, 'bar')
    const bg = part(canvasElement, 'bar-bg')
    const start =
      h1.getBoundingClientRect().top -
      (bar.getBoundingClientRect().bottom + TITLE_GAP)
    await scrollTo(canvasElement, Math.round(start) + 24)
    expect(getComputedStyle(bg).opacity).toBe('0')
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('0')
    await scrollTo(canvasElement, Math.round(start) + 49)
    expect(getComputedStyle(bg).opacity).toBe('1')
    expect(getComputedStyle(part(canvasElement, 'bar-title')).opacity).toBe('1')
  },
}

/** Phone, over a map: a long title wraps under it and collapses with an ellipsis. */
export const OverMapPhone: Story = {
  ...OverMap,
  args: { ...MEDIA_ARGS, title: LONG_TITLE },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  decorators: [withPane()],
  play: async ({ canvasElement }) => {
    await settle()
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Go back' }),
      ).toBeVisible(),
    )
  },
}

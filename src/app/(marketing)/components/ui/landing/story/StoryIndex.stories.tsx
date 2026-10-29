import { Box, Grid } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import messages from '@/app/(marketing)/i11n.json'

import { StoryIndex } from './StoryIndex'
import { setStoryStage } from './storyState'
import { buildIndexGroups } from './storySteps'

const en = messages.en.landing.story.index
const zh = messages.zh_hk.landing.story.index

/**
 * Story-only: the colour a semantic token resolves to, read off a probe
 * element, so the stories compare with the tokens and not with hex values.
 */
function tokenColor(host: HTMLElement, token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(--chakra-colors-${token.replace('.', '-')})`
  host.appendChild(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/**
 * Story-only: the index in the box it works in: a grid that spans both acts
 * (here a tall placeholder), so it can stick along them. From `lg` the index
 * has its own column, as in the story.
 */
const withSection: Decorator = (Story) => (
  <Box maxW="page" mx="auto" px={{ base: 4, md: 6, lg: 8 }} py={10}>
    <Grid
      display={{ base: 'block', lg: 'grid' }}
      templateColumns={{ lg: '9rem minmax(0, 1fr)' }}
      columnGap={8}
    >
      <Story />
      <Box
        minH="160vh"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="border.default"
        borderRadius="lg"
      />
    </Grid>
  </Box>
)

const meta = {
  title: 'Marketing/Landing/StoryIndex',
  component: StoryIndex,
  parameters: { layout: 'fullscreen' },
  args: { label: en.label, groups: buildIndexGroups(en) },
  decorators: [withSection],
  // Each story starts at the hero, where no step is active.
  beforeEach: () => {
    setStoryStage('hero')
    return () => setStoryStage('hero')
  },
} satisfies Meta<typeof StoryIndex>

export default meta
type Story = StoryObj<typeof meta>

const activeLink = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLElement>('[data-story-index] [aria-current]')

/** Desktop (lg and up): a list in its own column, on a hairline, stuck under the header. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    const nav = within(canvasElement).getByRole('navigation', {
      name: args.label,
    })
    await expect(getComputedStyle(nav).position).toBe('sticky')
    // `list-style: none` drops the list in Safari with VoiceOver unless the
    // role is stated: the index is a list of its eight steps.
    const list = within(nav).getByRole('list')
    await expect(list.tagName).toBe('OL')
    await expect(list).toHaveAttribute('role', 'list')
    await expect(within(list).getAllByRole('listitem')).toHaveLength(8)
    const links = within(nav).getAllByRole('link')
    await expect(links.map((link) => link.textContent)).toEqual([
      en.post,
      en.quotes,
      en.chat,
      en.hire,
      en.review,
      en.workerFind,
      en.workerQuote,
      en.workerProfile,
    ])
    // A list down the left: each link on its own line, in reading order.
    const tops = links.map((link) => link.getBoundingClientRect().top)
    await expect(tops).toEqual([...tops].sort((a, b) => a - b))
    await expect(new Set(tops).size).toBe(links.length)
    // At the hero no step is active: every label is `text.subtle`.
    await expect(activeLink(canvasElement)).toBeNull()
    for (const link of links) {
      await expect(getComputedStyle(link).color).toBe(
        tokenColor(canvasElement, 'text.subtle'),
      )
    }
  },
}

/**
 * Desktop, a step active (the tracker's stage): its label is `text.default`
 * with a 2px green 600 bar, the rest stay `text.subtle` with no bar.
 */
export const DesktopActiveStep: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    setStoryStage('quotes')
    const canvas = within(canvasElement)
    const quotes = await canvas.findByRole('link', { name: en.quotes })
    await waitFor(() => expect(quotes).toHaveAttribute('aria-current'))
    await expect(getComputedStyle(quotes).color).toBe(
      tokenColor(canvasElement, 'text.default'),
    )
    const bar = quotes.querySelector<HTMLElement>('[data-story-index-bar]')
    if (!bar) throw new Error('The active link has no bar')
    const style = getComputedStyle(bar)
    await expect(style.backgroundColor).toBe(
      tokenColor(canvasElement, 'accent.active'),
    )
    await expect(style.width).toBe('2px')
    await expect(style.opacity).toBe('1')
    // Only one link is current, and the others have no bar and the subtle colour.
    await expect(canvasElement.querySelectorAll('[aria-current]')).toHaveLength(
      1,
    )
    const other = canvas.getByRole('link', { name: en.chat })
    await expect(getComputedStyle(other).color).toBe(
      tokenColor(canvasElement, 'text.subtle'),
    )
    const otherBar = other.querySelector<HTMLElement>('[data-story-index-bar]')
    await expect(getComputedStyle(otherBar as HTMLElement).opacity).toBe('0')
  },
}

/** Desktop, in the worker act: the active step is in the second group. */
export const DesktopWorkerStep: Story = {
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    setStoryStage('workerQuote')
    const canvas = within(canvasElement)
    const link = await canvas.findByRole('link', { name: en.workerQuote })
    await waitFor(() => expect(link).toHaveAttribute('aria-current'))
    await expect(link).toHaveAttribute('href', '#how-it-works-workerQuote')
    await expect(canvasElement.querySelectorAll('[aria-current]')).toHaveLength(
      1,
    )
  },
}

/**
 * Below lg (phone width): a row that sticks right under the header, full
 * width on a hairline, with a thin divider between the two acts. The active
 * label has a green 600 underline.
 */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement, args }) => {
    setStoryStage('chat')
    const nav = within(canvasElement).getByRole('navigation', {
      name: args.label,
    })
    const style = getComputedStyle(nav)
    await expect(style.position).toBe('sticky')
    // The header is 56px plus its 1px borders.
    await expect(style.top).toBe('58px')
    await expect(style.borderBottomWidth).toBe('1px')
    const list = nav.querySelector('ol') as HTMLElement
    await expect(getComputedStyle(list).flexDirection).toBe('row')
    const links = within(nav).getAllByRole('link')
    const tops = new Set(links.map((link) => link.getBoundingClientRect().top))
    await expect(tops.size).toBe(1)
    // Each link is a 44px-high target.
    await expect(
      links[0]?.getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44)
    const gap = nav.querySelector('[data-story-index-gap]') as HTMLElement
    await expect(getComputedStyle(gap).width).toBe('1px')
    const chat = await within(nav).findByRole('link', { name: en.chat })
    await waitFor(() => expect(chat).toHaveAttribute('aria-current'))
    const bar = chat.querySelector('[data-story-index-bar]') as HTMLElement
    await expect(getComputedStyle(bar).height).toBe('2px')
    await expect(getComputedStyle(bar).backgroundColor).toBe(
      tokenColor(canvasElement, 'accent.active'),
    )
  },
}

/** Below lg, a worker step active: the row has scrolled to bring it into view. */
export const PhoneWorkerStep: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    setStoryStage('workerProfile')
    const nav = within(canvasElement).getByRole('navigation')
    const link = await within(nav).findByRole('link', {
      name: en.workerProfile,
    })
    await waitFor(() => expect(link).toHaveAttribute('aria-current'))
    const list = nav.querySelector('ol') as HTMLElement
    // The row is wider than the screen, so the active label was scrolled in.
    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
    await waitFor(
      () => {
        const row = list.getBoundingClientRect()
        const box = link.getBoundingClientRect()
        expect(box.left).toBeGreaterThanOrEqual(row.left - 1)
        expect(box.right).toBeLessThanOrEqual(row.right + 1)
      },
      { timeout: 3000 },
    )
  },
}

/** Traditional Chinese labels (a worker is 工作者 elsewhere; no label needs it). */
export const TraditionalChinese: Story = {
  args: { label: zh.label, groups: buildIndexGroups(zh) },
  globals: { viewport: { value: 'desktop', isRotated: false } },
  play: async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', {
      name: zh.label,
    })
    await expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual([
      zh.post,
      zh.quotes,
      zh.chat,
      zh.hire,
      zh.review,
      zh.workerFind,
      zh.workerQuote,
      zh.workerProfile,
    ])
  },
}

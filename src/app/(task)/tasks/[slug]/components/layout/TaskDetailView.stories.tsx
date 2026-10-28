import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { withTaskDetailPending } from '../../helpers/taskDetailStoryExtras'
import { storyTaskDetail } from '../../helpers/taskDetailStoryFixtures'
import { TaskDetailView } from './TaskDetailView'

/**
 * One CSS-responsive tree: below `lg` a map hero with sticky chrome and a
 * pinned main button, from `lg` a page column over the map. The page header's
 * bar floats over the map at every width, with Back and the options menu in it
 * and the title collapsing into it. The map itself is published to the
 * layout's host, so a story shows a plain surface.
 */
const meta = {
  title: 'Task detail/Layout/TaskDetailView',
  component: TaskDetailView,
  parameters: { layout: 'fullscreen' },
  // The page scrolls the window here, as the app shell's pane does in the app.
  beforeEach: () => () => window.scrollTo(0, 0),
} satisfies Meta<typeof TaskDetailView>

export default meta
type Story = StoryObj<typeof meta>

const TITLE = 'Mount bookshelf on living room wall'

/** Wait for the task title, the sign that the page has its data. */
async function expectTitle(canvasElement: HTMLElement) {
  return within(canvasElement).findByRole(
    'heading',
    { level: 1, name: TITLE },
    { timeout: 4000 },
  )
}

const bar = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-sticky-header-bar]') as HTMLElement

const barTitle = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-sticky-header-bar-title]') as HTMLElement

/** The bar's row: its edges are the page's content edges. */
const barRow = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-sticky-header-row]') as HTMLElement

/** Back and the options menu are in the bar, at the very top, over the map. */
async function expectBar(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const back = await canvas.findByRole('button', { name: 'Go back' })
  const options = await canvas.findByRole('button', { name: 'Task options' })
  await expect(back).toBeVisible()
  await expect(options).toBeVisible()
  const top = bar(canvasElement).getBoundingClientRect().top
  await expect(Math.abs(top)).toBeLessThan(1)
  for (const button of [back, options]) {
    const box = button.getBoundingClientRect()
    await expect(box.top).toBeGreaterThanOrEqual(top)
    await expect(box.bottom).toBeLessThanOrEqual(top + 56)
  }
  // Round 44px chips inside the margin: their outer edges are the content's.
  const row = barRow(canvasElement).getBoundingClientRect()
  const backBox = back.getBoundingClientRect()
  const optionsBox = options.getBoundingClientRect()
  await expect(Math.abs(backBox.width - 44)).toBeLessThan(0.5)
  await expect(Math.abs(backBox.left - row.left)).toBeLessThan(1)
  await expect(Math.abs(optionsBox.right - row.right)).toBeLessThan(1)
}

/** Focus and reading order follow the bar's row: Back, the options menu, then the page and its title. */
async function expectBarOrder(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const back = await canvas.findByRole('button', { name: 'Go back' })
  const options = await canvas.findByRole('button', { name: 'Task options' })
  back.focus()
  await userEvent.tab()
  await expect(document.activeElement).toBe(options)
  const title = await expectTitle(canvasElement)
  await expect(
    options.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
}

/** Past the title: the bar is still at the top, the title is in it. */
async function expectCollapsed(canvasElement: HTMLElement) {
  window.scrollTo(0, 2000)
  await waitFor(() =>
    expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('1'),
  )
  await expect(
    Math.abs(bar(canvasElement).getBoundingClientRect().top),
  ).toBeLessThan(1)
  await expect(barTitle(canvasElement)).toHaveTextContent(TITLE)
  await expect(
    within(canvasElement).getAllByRole('heading', { level: 1 }),
  ).toHaveLength(1)
  // The bar copy starts 52px in, after Back's chip, and ends 8px before the options chip.
  const row = barRow(canvasElement).getBoundingClientRect()
  const copy = barTitle(canvasElement).getBoundingClientRect()
  const options = within(canvasElement)
    .getByRole('button', { name: 'Task options' })
    .getBoundingClientRect()
  await expect(Math.abs(copy.left - (row.left + 52))).toBeLessThan(1)
  await expect(Math.abs(copy.right - (options.left - 8))).toBeLessThan(1)
}

/** Desktop: Back and the options menu in the bar over the map band, title, tabs, cards and the rail. */
export const Desktop: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => {
    await expectTitle(canvasElement)
    await expectBar(canvasElement)
    await expectBarOrder(canvasElement)
  },
}

/** Desktop, scrolled: the title has collapsed into the bar, which stays at the top. */
export const DesktopScrolled: Story = {
  ...Desktop,
  play: async ({ canvasElement }) => {
    await expectTitle(canvasElement)
    await expectCollapsed(canvasElement)
    await expectBar(canvasElement)
  },
}

/** Tablet: the compact layout with the map band; no rail. */
export const Tablet: Story = {
  globals: { viewport: { value: 'tablet' } },
  decorators: [withTaskDetailStory({ viewer: 'owner' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => {
    await expectTitle(canvasElement)
    await expectBar(canvasElement)
  },
}

/** Phone: map band, the bar with Back and the options menu, pinned main button. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withTaskDetailStory({ viewer: 'worker' }, { maxWidth: '100%' })],
  play: async ({ canvasElement }) => {
    await expectTitle(canvasElement)
    await expectBar(canvasElement)
    await expectBarOrder(canvasElement)
  },
}

/** Phone, scrolled: the title has collapsed into the bar beside Back. */
export const PhoneScrolled: Story = {
  ...Phone,
  play: async ({ canvasElement }) => {
    await expectTitle(canvasElement)
    await expectCollapsed(canvasElement)
    await expectBar(canvasElement)
  },
}

const LONG_TITLE =
  'Mount a floating bookshelf, three picture rails and a TV bracket across the living room and hallway before the weekend'

/** The big title's line: 34px at 1.2. */
const TITLE_LINE = 34 * 1.2

/** The first link under the title: the page's content moves with the title's height. */
const linkBelow = (canvasElement: HTMLElement, h1: HTMLElement) =>
  within(canvasElement)
    .getAllByRole('link')
    .find((link) =>
      Boolean(
        h1.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ) as HTMLElement

/** The bar's copy once the title has collapsed into it: one line, cut off with an ellipsis. */
async function expectBarCopyCutOff(canvasElement: HTMLElement) {
  window.scrollTo(0, 2000)
  await waitFor(() =>
    expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('1'),
  )
  const copy = barTitle(canvasElement)
  await expect(getComputedStyle(copy).textOverflow).toBe('ellipsis')
  await expect(copy.scrollWidth).toBeGreaterThan(copy.clientWidth)
  // It stops 8px short of the options chip.
  const options = within(canvasElement).getByRole('button', {
    name: 'Task options',
  })
  await expect(
    Math.abs(
      copy.getBoundingClientRect().right -
        (options.getBoundingClientRect().left - 8),
    ),
  ).toBeLessThan(1)
}

const longTitleDecorators = [
  withTaskDetailStory(
    { viewer: 'owner', task: storyTaskDetail({ title: LONG_TITLE }) },
    { maxWidth: '100%' },
  ),
]

/**
 * Phone, a long title: three lines under the map with an ellipsis (the heading
 * still holds the whole title and is a toggle), then one line with an ellipsis
 * in the bar. A tap opens it and another folds it back.
 */
export const PhoneLongTitle: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: longTitleDecorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const h1 = await canvas.findByRole(
      'heading',
      { level: 1, name: LONG_TITLE },
      { timeout: 4000 },
    )
    // Three lines at the top, closed.
    const toggle = await within(h1).findByRole('button')
    await expect(
      Math.abs(h1.getBoundingClientRect().height - 3 * TITLE_LINE),
    ).toBeLessThan(1)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(h1).toHaveTextContent(LONG_TITLE)
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expectBar(canvasElement)

    // A tap opens it, and a second folds it back to three lines.
    const shut = h1.getBoundingClientRect().height
    await userEvent.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'))
    await expect(h1.getBoundingClientRect().height).toBeGreaterThan(shut)
    await userEvent.click(toggle)
    await waitFor(() =>
      expect(toggle).toHaveAttribute('aria-expanded', 'false'),
    )
    await expect(
      Math.abs(h1.getBoundingClientRect().height - shut),
    ).toBeLessThan(1)

    // Once it has collapsed into the bar it is one line, cut off.
    await expectBarCopyCutOff(canvasElement)
  },
}

/**
 * Phone, a long title opened with a tap: the whole title shows and the page
 * under it moves down. It is still the one h1, the bar's copy is still one
 * line, and it stays open for when the page is back at the top.
 */
export const PhoneLongTitleExpanded: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: longTitleDecorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const h1 = await canvas.findByRole(
      'heading',
      { level: 1, name: LONG_TITLE },
      { timeout: 4000 },
    )
    const toggle = await within(h1).findByRole('button')
    const below = linkBelow(canvasElement, h1)
    const shut = h1.getBoundingClientRect().height
    const belowTop = below.getBoundingClientRect().top

    await userEvent.click(toggle)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'))
    const open = h1.getBoundingClientRect().height
    await expect(open).toBeGreaterThan(shut + TITLE_LINE - 1)
    await expect(
      Math.abs(below.getBoundingClientRect().top - (belowTop + open - shut)),
    ).toBeLessThan(1.5)
    await expect(h1).toHaveTextContent(LONG_TITLE)
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)

    // Collapsed into the bar the title is one line either way.
    await expectBarCopyCutOff(canvasElement)
    window.scrollTo(0, 0)
    await waitFor(() =>
      expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('0'),
    )
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(h1.getBoundingClientRect().height).toBeGreaterThan(shut)
  },
}

/** Desktop while the task loads: skeleton title and summary. */
export const Loading: Story = {
  globals: { viewport: { value: 'desktop' } },
  decorators: [withTaskDetailPending('loading')],
}

/** Phone while the task loads. */
export const PhoneLoading: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withTaskDetailPending('loading')],
}

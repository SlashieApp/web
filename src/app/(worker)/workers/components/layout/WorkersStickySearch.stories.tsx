import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor } from 'storybook/test'

import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'

import { withWorkersStory } from '../workersStoryDecorator'
import { WorkersStickySearch } from './WorkersStickySearch'

/**
 * The search bar sits over the map, then pins to the top of the scrolling
 * `<main>`. Docked, its background and shadow run edge to edge but the search
 * stays in the page container, on the logo line (R5). It watches its nearest
 * `main`, so the story puts it in a short scrolling one.
 */
const meta = {
  title: 'Workers/WorkersStickySearch',
  component: WorkersStickySearch,
  parameters: { layout: 'fullscreen' },
  decorators: [withWorkersStory()],
  render: () => (
    <Box
      as="main"
      h="420px"
      overflowY="auto"
      bg="bg.canvas"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Box h="160px" bg="bg.subtle" />
      <WorkersStickySearch />
      <Box h="900px" />
    </Box>
  ),
} satisfies Meta<typeof WorkersStickySearch>

export default meta
type Story = StoryObj<typeof meta>

/** At the top of the page: a floating rounded card over the map area. */
export const Floating: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-stuck="false"]'),
    ).not.toBeNull()
  },
}

/** Scrolled past the map: the bar pins to the top; its background runs full width, the search stays on the logo line. */
export const Docked: Story = {
  play: async ({ canvasElement }) => {
    const main = canvasElement.querySelector('main')
    if (!main) throw new Error('Story scroll pane not found')
    main.scrollTop = 260
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-stuck="true"]')).not.toBeNull(),
    )
  },
}

/** Phone, docked: the compact area field and Filters button across the full width. */
export const PhoneDocked: Story = {
  ...Docked,
  globals: { viewport: { value: 'mobile1' } },
}

/** The search card that shows (the phone card or the desktop one): the visible form's parent. */
function searchCardOf(bar: Element) {
  return [...bar.querySelectorAll('form')].find((form) =>
    form.checkVisibility(),
  )?.parentElement
}

/** The bar's transitions (200ms) are over, so a check sees where it ends up. */
const SETTLE_MS = 500

/** Scroll the story's pane past the map and wait for the bar to stick and settle. */
async function dock(canvasElement: HTMLElement) {
  const main = canvasElement.querySelector('main')
  if (!main) throw new Error('Story scroll pane not found')
  main.scrollTop = 260
  await waitFor(() =>
    expect(canvasElement.querySelector('[data-stuck="true"]')).not.toBeNull(),
  )
  await new Promise((resolve) => setTimeout(resolve, SETTLE_MS))
  return main
}

/**
 * R5: the stuck bar's background is the whole pane wide; its content (the
 * search card) is in the page container, on the logo line and the menu line,
 * the same place as when it floats. The story's pane has a 1px border, so the
 * lines are measured from the pane's own box.
 */
async function expectDockedOnTheLines(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const main = await dock(canvasElement)
  const bar = canvasElement.querySelector('[data-stuck="true"]')
  if (!bar) throw new Error('Stuck bar not found')
  const pane = boxOf(main)
  expectPx(boxOf(bar).left, pane.left + 1, 'the bar runs to the left edge')
  expectPx(boxOf(bar).right, pane.right - 1, 'the bar runs to the right edge')
  const card = searchCardOf(bar)
  if (!card) throw new Error('Search card not found')
  const { logo, menu } = lines(canvasElement)
  expectPx(boxOf(card).left, logo, 'the search starts on the logo line')
  expectPx(boxOf(card).right, menu, 'the search ends on the menu line')
}

/** Docked at 1366: the bar spans the pane, the search sits on the lines (1216 wide). */
export const DockedOnTheLines1366: Story = {
  ...viewportAt(1366),
  play: ({ canvasElement }) => expectDockedOnTheLines(canvasElement, 1366),
}

/** Docked at 1920: the margin beside the container is bar background, the search stays on the lines. */
export const DockedOnTheLines1920: Story = {
  ...viewportAt(1920),
  play: ({ canvasElement }) => expectDockedOnTheLines(canvasElement, 1920),
}

/** Docked at 1024 (lg, gutters 32). */
export const DockedOnTheLines1024: Story = {
  ...viewportAt(1024),
  play: ({ canvasElement }) => expectDockedOnTheLines(canvasElement, 1024),
}

/** Docked on a phone: the compact card keeps the 16 gutters, the bar still runs edge to edge. */
export const DockedOnTheLinesPhone: Story = {
  ...viewportAt(390),
  play: ({ canvasElement }) => expectDockedOnTheLines(canvasElement, 390),
}

/** Floating at 1920: the same lines as docked (the search does not move when it sticks). */
export const FloatingOnTheLines1920: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1920)
    const floating = canvasElement.querySelector('[data-stuck="false"]')
    if (!floating) throw new Error('Bar not found')
    const card = searchCardOf(floating)
    if (!card) throw new Error('Search card not found')
    const { logo, menu } = lines(canvasElement)
    expectPx(boxOf(card).left, logo)
    expectPx(boxOf(card).right, menu)
  },
}

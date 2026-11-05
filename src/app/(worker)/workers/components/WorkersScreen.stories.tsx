import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { pageGutterPx } from '@/theme/pageContainer'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'

import { WorkersScreen } from './WorkersScreen'
import { withWorkersApollo } from './workersStoryDecorator'
import { storyWorkers } from './workersStoryFixtures'

/**
 * Worker directory: area map on top, the search bar over it, results below.
 * The map loads live Mapbox tiles when a token is configured, otherwise it
 * shows its "Map preview unavailable" band. Search results are story data.
 */
const meta = {
  title: 'Workers/WorkersScreen',
  component: WorkersScreen,
  parameters: { layout: 'fullscreen' },
  args: { initialUrlState: {} },
} satisfies Meta<typeof WorkersScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Results for the default area (London) at 10 miles. */
export const Default: Story = {
  decorators: [withWorkersApollo()],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole(
        'heading',
        { name: '8 workers near London' },
        { timeout: 5000 },
      ),
    ).toBeVisible()
  },
}

/** Opened from a shared link: skills search, identity filter and a 25 mile radius already applied. */
export const SharedFilters: Story = {
  args: {
    initialUrlState: {
      radiusMiles: 25,
      searchText: 'plumbing',
      verifiedOnly: true,
    },
  },
  decorators: [
    withWorkersApollo({
      workers: storyWorkers.filter((worker) => worker.isVerified).slice(0, 4),
    }),
  ],
}

/** Phone: compact search bar under the map, two-column results, and a way back over the map (FE-445). */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withWorkersApollo()],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Back' }),
    ).toBeVisible()
  },
}

/** Search still loading: skeleton title and cards under the map. */
export const Loading: Story = {
  decorators: [withWorkersApollo({ workers: null })],
}

/** No workers in the area: the empty-state card. */
export const Empty: Story = {
  decorators: [withWorkersApollo({ workers: [] })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'No workers here yet',
        {},
        { timeout: 5000 },
      ),
    ).toBeVisible()
  },
}

/**
 * The results sit in the page container (R4): the title and the first card
 * start on the logo line, and the container's content box ends on the menu line.
 */
async function expectResultsOnTheLines(
  canvasElement: HTMLElement,
  width: number,
) {
  expectWindowWidth(canvasElement, width)
  const canvas = within(canvasElement)
  const title = await canvas.findByRole(
    'heading',
    { name: '8 workers near London' },
    { timeout: 5000 },
  )
  const container = title.closest('[data-page-container]')
  if (!container) throw new Error('Results are not in a page container')
  const { logo, menu } = lines(canvasElement)
  const gutter = pageGutterPx(width)
  expectPx(boxOf(title).left, logo, 'the title is on the logo line')
  expectPx(boxOf(container).left + gutter, logo, 'the container starts there')
  expectPx(boxOf(container).right - gutter, menu, 'and ends on the menu line')
  const card = (await canvas.findAllByRole('link')).find((link) =>
    link.getAttribute('href')?.startsWith('/profile/'),
  )
  if (!card) throw new Error('No worker card found')
  expectPx(boxOf(card).left, logo, 'the first card is on the logo line')
}

/** R4 at 1366: the results fill the container, from the logo line. */
export const OnTheLines1366: Story = {
  ...viewportAt(1366),
  decorators: [withWorkersApollo()],
  play: ({ canvasElement }) => expectResultsOnTheLines(canvasElement, 1366),
}

/** R4 at 1920: the container stops at 80rem and stays centred. */
export const OnTheLines1920: Story = {
  ...viewportAt(1920),
  decorators: [withWorkersApollo()],
  play: ({ canvasElement }) => expectResultsOnTheLines(canvasElement, 1920),
}

/** Phone at 390: the Back chip over the map and the results both start on the 16 gutter (the logo line). */
export const PhoneOnTheLines: Story = {
  ...viewportAt(390),
  decorators: [withWorkersApollo()],
  play: async ({ canvasElement }) => {
    await expectResultsOnTheLines(canvasElement, 390)
    const back = await within(canvasElement).findByRole('button', {
      name: 'Back',
    })
    expectPx(boxOf(back).left, lines(canvasElement).logo, 'Back is on the line')
  },
}

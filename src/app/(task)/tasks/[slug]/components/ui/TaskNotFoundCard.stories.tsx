import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  expectWindowWidth,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'

import { TaskNotFoundCard } from './TaskNotFoundCard'

/**
 * "Task not found", shown by the detail page (inside the app shell) and by the
 * quote page (no shell, so the card is the whole page). The shared StatusCard:
 * centred in the page container, one width (R6).
 */
const meta = {
  title: 'Task detail/Parts/TaskNotFoundCard',
  component: TaskNotFoundCard,
  parameters: { layout: 'fullscreen' },
  args: {
    heading: 'Task not found',
    description: 'This task may have been removed or is no longer available.',
    browseLabel: 'Search tasks',
  },
} satisfies Meta<typeof TaskNotFoundCard>

export default meta
type Story = StoryObj<typeof meta>

const cardOf = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('region', { name: /task not found/i })

/** The detail page's copy, with the eyebrow above the heading. */
export const Default: Story = {
  args: { eyebrow: 'Task' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Task')
    await canvas.findByRole('link', { name: 'Search tasks' })
  },
}

/** The quote page's card: no site header or shell around it. */
export const FullPage: Story = {
  args: { fullPage: true },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Search tasks' })
  },
}

/** R6 at 1024, 1366 and 1920: centred in the window, 448 wide. */
export const Wide1366: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Search tasks' })
    expectWindowWidth(canvasElement, 1366)
    expectCentredCardBox(canvasElement, cardOf(canvasElement), 'not found')
  },
}

export const Wide1920: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Search tasks' })
    expectWindowWidth(canvasElement, 1920)
    expectCentredCardBox(canvasElement, cardOf(canvasElement), 'not found')
  },
}

export const Desktop1024: Story = {
  ...viewportAt(1024),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Search tasks' })
    expectWindowWidth(canvasElement, 1024)
    expectCentredCardBox(canvasElement, cardOf(canvasElement), 'not found')
  },
}

/** Phone: the card fills the container (the window less the 16 gutters). */
export const Phone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Search tasks' })
    expectWindowWidth(canvasElement, 390)
    expectCentredCardBox(canvasElement, cardOf(canvasElement), 'not found')
    expect(
      canvasElement.ownerDocument.documentElement.scrollWidth,
    ).toBeLessThanOrEqual(390)
  },
}

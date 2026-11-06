import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { desktop1280 } from '@/app/(stepflow)/stepFlowSpacing.testing'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import {
  expectPanelPadding,
  expectRowsAreRows,
  openPopover,
} from '@/ui/Dropdown/menuSpacing.testing'

import { storyRows } from '../myTasksStoryFixtures'
import { MyTaskCard } from './MyTaskCard'
import { expectRowAnatomy } from './myTaskRow.testing'

const meta = {
  title: 'My tasks/MyTaskCard',
  component: MyTaskCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="2xl">
        <Story />
      </Box>
    ),
  ],
  args: { row: storyRows.upcomingWeekday, layout: 'card' },
} satisfies Meta<typeof MyTaskCard>

export default meta
type Story = StoryObj<typeof meta>

/** What a tap at the middle of `element` lands on. */
function tapTarget(element: HTMLElement) {
  const box = element.getBoundingClientRect()
  return element.ownerDocument.elementFromPoint(
    box.left + box.width / 2,
    box.top + box.height / 2,
  )
}

async function openMenu(canvasElement: HTMLElement, title: string) {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: `Options for ${title}` }),
  )
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() =>
    expect(body.getByRole('button', { name: 'Share task' })).toBeVisible(),
  )
  return body
}

/** Upcoming, your booked job this week: the date and time above the title, the Hosted and Awarded pills, then area and price; a tap anywhere opens the task; nothing to do, so the ⋮ menu. */
export const UpcomingWithMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('28 Oct, 16:25')).toBeVisible()
    await expect(canvas.getByText('Hosted')).toBeVisible()
    await expect(canvas.getByText('Awarded')).toBeVisible()
    const line = canvas.getByText('Southwark · £120')
    await expect(line).toBeVisible()
    await expectRowAnatomy(canvasElement, 'Mount a 55-inch TV', {
      time: true,
      pills: 2,
    })
    const title = canvas.getByRole('link', { name: 'Mount a 55-inch TV' })
    await expect(title).toHaveAttribute(
      'href',
      '/tasks/upcoming-weekday?from=tasks',
    )
    // The title's overlay covers the card; the ⋮ sits above it.
    await expect(tapTarget(line)).toBe(title)
    const options = canvas.getByRole('button', {
      name: 'Options for Mount a 55-inch TV',
    })
    await expect(options.contains(tapTarget(options))).toBe(true)
    const menu = await openMenu(canvasElement, 'Mount a 55-inch TV')
    await expect(menu.queryByRole('link', { name: 'Edit task' })).toBeNull()
  },
}

/** Upcoming, your job from yesterday that nobody has marked: Overdue (in red), and Mark done (to the booking) in place of the ⋮ menu. */
export const UpcomingOverdue: Story = {
  args: { row: storyRows.upcomingOverdue },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const overdue = canvas.getByText('Overdue')
    await expect(overdue).toBeVisible()
    await expect(getComputedStyle(overdue).color).not.toBe(
      getComputedStyle(canvas.getByText('Hosted')).color,
    )
    await expectRowAnatomy(canvasElement, 'Replace a light fitting', {
      time: true,
      pills: 2,
    })
    // The button is on the right of the row, level with the text.
    const mark = canvas.getByRole('link', {
      name: 'Mark done: Replace a light fitting',
    })
    await expect(mark).toHaveAttribute(
      'href',
      '/tasks/upcoming-overdue?from=tasks#task-order',
    )
    await expect(mark.getBoundingClientRect().left).toBeGreaterThan(
      overdue.getBoundingClientRect().right,
    )
    await expect(
      canvas.queryByRole('button', { name: /^Options for/ }),
    ).toBeNull()
  },
}

/** Upcoming, a job you won today that the customer marked Done: Confirm done. */
export const UpcomingConfirmDone: Story = {
  args: { row: storyRows.upcomingToday },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('22 Oct, 09:00')).toBeVisible()
    await expect(canvas.getByText('Quoted')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Confirm done: Deep-clean an oven' }),
    ).toBeVisible()
  },
}

/** Upcoming, a job you won that the customer asked to move: its date and time, Answer reschedule. */
export const UpcomingAnswerReschedule: Story = {
  args: { row: storyRows.upcomingReschedule },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('23 Oct, 10:00')).toBeVisible()
    await expect(
      canvas.getByRole('link', {
        name: 'Answer reschedule: Hang a mirror in the hall',
      }),
    ).toHaveAttribute(
      'href',
      '/tasks/upcoming-reschedule?from=tasks#task-order',
    )
  },
}

/** Upcoming, more than a week out: the date and time lead. */
export const UpcomingLater: Story = {
  args: { row: storyRows.upcomingDate },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('3 Nov, 09:30')).toBeVisible()
    await expect(canvas.getByText('Camden · £150')).toBeVisible()
  },
}

/** Open, your task with quotes in: the photo, "3 quotes · £80", and Compare quotes (to the quotes). */
export const OpenCompareQuotes: Story = {
  args: { row: storyRows.openCompare, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const line = canvas.getByText('3 quotes · £80')
    await expect(line).toBeVisible()
    // Hosted only: no status pill before it is booked.
    await expect(canvas.getByText('Hosted')).toBeVisible()
    await expectRowAnatomy(canvasElement, 'Fix a leaking kitchen tap', {
      pills: 1,
    })
    const compare = canvas.getByRole('link', {
      name: 'Compare quotes: Fix a leaking kitchen tap',
    })
    await expect(compare).toHaveAttribute(
      'href',
      '/tasks/open-compare?from=tasks#task-quotes',
    )
    // The button takes its own tap; the rest of the row opens the task.
    await expect(compare.contains(tapTarget(compare))).toBe(true)
    await expect(tapTarget(line)).toBe(
      canvas.getByRole('link', { name: 'Fix a leaking kitchen tap' }),
    )
  },
}

/** Open, your task with no photo and no quotes yet: the category icon and the ⋮ menu with Edit task. */
export const OpenNoQuotes: Story = {
  args: { row: storyRows.openNoQuotes, layout: 'row' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('No quotes yet · £60'),
    ).toBeVisible()
    // No photo: the category icon, in the same 56 square.
    await expectRowAnatomy(canvasElement, 'Clear out a garage', { pills: 1 })
    const menu = await openMenu(canvasElement, 'Clear out a garage')
    await expect(menu.getByRole('link', { name: 'Edit task' })).toHaveAttribute(
      'href',
      '/tasks/open-no-quotes/edit',
    )
    await expect(menu.queryByRole('button', { name: /Report/ })).toBeNull()
  },
}

/**
 * The card menu's panel (FE-481 menus): the rows sit 8 inside the panel on every
 * side, a panel sized to its rows; they stay rows, 44 tall and 2 apart.
 */
export const MenuSpacing: Story = {
  ...desktop1280,
  args: { row: storyRows.openNoQuotes, layout: 'row' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Options for Clear out a garage',
    })
    const panel = await openPopover(trigger)
    await expectPanelPadding(panel)
    const rows = [...panel.querySelectorAll('a, button')]
    await expect(rows).toHaveLength(2)
    await expectRowsAreRows(rows, 2)
  },
}

/**
 * Open, your task Slashie suspended (BE-108): still listed, with quotes in
 * but no Compare quotes button, and the ⋮ menu has Share but no Edit task.
 */
export const OpenSuspended: Story = {
  args: {
    row: {
      ...storyRows.openCompare,
      id: 'open-suspended',
      action: null,
      suspended: true,
    },
    layout: 'row',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('link', { name: /Compare quotes/ }),
    ).toBeNull()
    const menu = await openMenu(canvasElement, 'Fix a leaking kitchen tap')
    await expect(menu.queryByRole('link', { name: 'Edit task' })).toBeNull()
  },
}

/** Open, a quote you sent: "Quote sent · £75"; the ⋮ menu has Share and Report. */
export const OpenQuoteSent: Story = {
  args: { row: storyRows.openQuoteSent, layout: 'row' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Quote sent · £75'),
    ).toBeVisible()
    await expect(within(canvasElement).getByText('Quoted')).toBeVisible()
    const menu = await openMenu(canvasElement, 'Assemble a standing desk')
    await expect(menu.getByRole('button', { name: /Report/ })).toBeVisible()
    await expect(menu.queryByRole('link', { name: 'Edit task' })).toBeNull()
  },
}

/** Past, not reviewed yet: Hosted and Completed pills, date and price, and Review (to the review form). */
export const PastReview: Story = {
  args: { row: storyRows.pastReview, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('20 Oct · £95')).toBeVisible()
    await expect(canvas.getByText('Hosted')).toBeVisible()
    await expect(canvas.getByText('Completed')).toBeVisible()
    await expectRowAnatomy(canvasElement, 'Deep-clean a studio flat', {
      pills: 2,
    })
    await expect(
      canvas.getByRole('link', { name: 'Review: Deep-clean a studio flat' }),
    ).toHaveAttribute('href', '/tasks/past-review/review?orderId=order-review')
  },
}

/** Past, cancelled: the Cancelled pill and the ⋮ menu. */
export const PastCancelled: Story = {
  args: { row: storyRows.pastCancelled, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Cancelled')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Options for Move two boxes' }),
    ).toBeVisible()
  },
}

/** Past row: how it ended is a pill; the line has the price (no end date known); the ⋮ menu. */
export const PastRow: Story = {
  args: { row: storyRows.pastClosed, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Closed')).toBeVisible()
    await expect(canvas.getByText('£90')).toBeVisible()
    await expect(canvas.getByText('Quoted')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Options for Clear a small garden' }),
    ).toBeVisible()
  },
}

/**
 * Past row: your quote is still pending while someone else is booked (BE-113).
 * The status is a pill, and there is no button, only the ⋮ menu.
 */
export const PastRowBookedByOther: Story = {
  args: { row: storyRows.pastBookedByOther, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Booked by someone else')).toBeVisible()
    await expect(canvas.getByText('£80')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Options for Paint a fence' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: /: Paint a fence$/ }),
    ).toBeNull()
  },
}

/** Past row: your quote is still pending and someone else's job is complete (BE-113). */
export const PastRowTaskCompleted: Story = {
  args: { row: storyRows.pastTaskCompleted, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Task completed')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Options for Tile a bathroom wall' }),
    ).toBeVisible()
  },
}

/**
 * Past row: your quote is still pending, the booking ended and the owner
 * hasn't reopened the task (BE-116). No button, only the ⋮ menu.
 */
export const PastRowOtherBookingEnded: Story = {
  args: { row: storyRows.pastOtherBookingEnded, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Booking cancelled')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Options for Fit a curtain rail' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: /: Fit a curtain rail$/ }),
    ).toBeNull()
  },
}

/** Phone width: a row with its button. */
export const Phone: Story = {
  args: { row: storyRows.openCompare, layout: 'row' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expectRowAnatomy(canvasElement, 'Fix a leaking kitchen tap', {
      pills: 1,
    })
  },
}

/** Traditional Chinese copy (from the `/zh-hk` URL prefix). */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  args: { row: storyRows.upcomingReschedule },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('10月23日 10:00')).toBeVisible()
    await expect(canvas.getByText('我報價')).toBeVisible()
    await expect(canvas.getByText('已選定')).toBeVisible()
    await expect(canvas.getByText('Hackney · £120')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: '回應改期：Hang a mirror in the hall' }),
    ).toBeVisible()
  },
}

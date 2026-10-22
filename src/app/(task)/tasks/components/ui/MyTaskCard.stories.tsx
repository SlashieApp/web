import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { storyRows } from '../myTasksStoryFixtures'
import { MyTaskCard } from './MyTaskCard'

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

/** Upcoming, your booked job this week: "On Wednesday", then date and time, area and price; a tap anywhere opens the task; nothing to do, so the ⋮ menu. */
export const UpcomingWithMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('On Wednesday')).toBeVisible()
    const line = canvas.getByText('28 Oct, 16:25 · Southwark · £120')
    await expect(line).toBeVisible()
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
    // A card has no photo.
    await expect(canvas.queryByRole('img')).toBeNull()
    const menu = await openMenu(canvasElement, 'Mount a 55-inch TV')
    await expect(menu.queryByRole('link', { name: 'Edit task' })).toBeNull()
  },
}

/** Upcoming, your job from yesterday that nobody has marked: Overdue (in red), and Mark done (to the booking) in place of the ⋮ menu. */
export const UpcomingOverdue: Story = {
  args: { row: storyRows.upcomingOverdue },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Overdue')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Mark done: Replace a light fitting' }),
    ).toHaveAttribute('href', '/tasks/upcoming-overdue?from=tasks#task-order')
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
    await expect(canvas.getByText('Today')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Confirm done: Deep-clean an oven' }),
    ).toBeVisible()
  },
}

/** Upcoming, a job you won that the customer asked to move: Tomorrow, Answer reschedule. */
export const UpcomingAnswerReschedule: Story = {
  args: { row: storyRows.upcomingReschedule },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Tomorrow')).toBeVisible()
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

/** Upcoming, more than a week out: the date leads. */
export const UpcomingLater: Story = {
  args: { row: storyRows.upcomingDate },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Tue 3 Nov')).toBeVisible()
    await expect(canvas.getByText('3 Nov, 09:30 · Camden · £150')).toBeVisible()
  },
}

/** Open, your task with quotes in: the photo, "3 quotes · £80", and Compare quotes (to the quotes). */
export const OpenCompareQuotes: Story = {
  args: { row: storyRows.openCompare, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const line = canvas.getByText('3 quotes · £80')
    await expect(line).toBeVisible()
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
    const menu = await openMenu(canvasElement, 'Clear out a garage')
    await expect(menu.getByRole('link', { name: 'Edit task' })).toHaveAttribute(
      'href',
      '/tasks/open-no-quotes/edit',
    )
    await expect(menu.queryByRole('button', { name: /Report/ })).toBeNull()
  },
}

/** Open, a quote you sent: "Quote sent · £75"; the ⋮ menu has Share and Report. */
export const OpenQuoteSent: Story = {
  args: { row: storyRows.openQuoteSent, layout: 'row' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Quote sent · £75'),
    ).toBeVisible()
    const menu = await openMenu(canvasElement, 'Assemble a standing desk')
    await expect(menu.getByRole('button', { name: /Report/ })).toBeVisible()
    await expect(menu.queryByRole('link', { name: 'Edit task' })).toBeNull()
  },
}

/** Past, the newest, not reviewed yet: no photo; date and price, Completed, and Review (to the review form). */
export const PastCardReview: Story = {
  args: { row: storyRows.pastReview },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText(/^20 Oct( 2026)? · £95$/)).toBeVisible()
    await expect(canvas.getByText('Completed')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Review: Deep-clean a studio flat' }),
    ).toHaveAttribute('href', '/tasks/past-review/review?orderId=order-review')
    await expect(canvas.queryByRole('img')).toBeNull()
  },
}

/** Past, the newest, cancelled: Cancelled and the ⋮ menu. */
export const PastCardMenu: Story = {
  args: { row: storyRows.pastCancelled },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Cancelled')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Options for Move two boxes' }),
    ).toBeVisible()
  },
}

/** Past row: how it ended and the price in the line (no end date known), with the ⋮ menu. */
export const PastRow: Story = {
  args: { row: storyRows.pastNotSelected, layout: 'row' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Not selected · £90')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Options for Clear a small garden' }),
    ).toBeVisible()
  },
}

/** Phone width: a row with its button. */
export const Phone: Story = {
  args: { row: storyRows.openCompare, layout: 'row' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
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
    await expect(canvas.getByText('明天')).toBeVisible()
    await expect(
      canvas.getByText('10月23日 10:00 · Hackney · £120'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: '回應改期：Hang a mirror in the hall' }),
    ).toBeVisible()
  },
}

import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { needsYouRows, storyRows } from '../myTasksStoryFixtures'
import { MyTaskCard } from './MyTaskCard'

const meta = {
  title: 'My tasks/MyTaskCard',
  component: MyTaskCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="560px">
        <Story />
      </Box>
    ),
  ],
  args: { row: storyRows.openHosted, onOpen: fn() },
} satisfies Meta<typeof MyTaskCard>

export default meta
type Story = StoryObj<typeof meta>

async function openMenu(canvasElement: HTMLElement) {
  const trigger = within(canvasElement).getByRole('button', {
    name: 'Task options',
  })
  await userEvent.click(trigger)
  const body = within(canvasElement.ownerDocument.body)
  await waitFor(() =>
    expect(body.getByRole('button', { name: 'Share task' })).toBeVisible(),
  )
  return body
}

/** Your open task: Hosted, five categories fading at the end, 3 quotes; ⋮ has Share and Edit. */
export const HostedOpen: Story = {
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(menu.getByRole('link', { name: 'Edit task' })).toHaveAttribute(
      'href',
      '/tasks/open-hosted/edit',
    )
    await expect(menu.queryByRole('button', { name: /Report/ })).toBeNull()
  },
}

/** A task you quoted on: Quoted, who posted it; ⋮ has Share and Report. */
export const QuotedOpen: Story = {
  args: { row: storyRows.openQuoted },
  play: async ({ canvasElement }) => {
    const menu = await openMenu(canvasElement)
    await expect(menu.getByRole('button', { name: /Report/ })).toBeVisible()
    await expect(menu.queryByRole('link', { name: 'Edit task' })).toBeNull()
  },
}

/** Booked today: the time leads in bold, then the price. */
export const BookedToday: Story = {
  args: { row: storyRows.bookedToday },
}

/** Booked and past its date: Overdue leads in red. */
export const BookedOverdue: Story = {
  args: { row: storyRows.bookedOverdue },
}

/** Someone else got the job: Quoted and Not selected, no time. */
export const NotSelected: Story = {
  args: { row: storyRows.notSelected },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('Not selected')).toBeVisible()
  },
}

/** Needs you, quotes to compare: the ask in bold and Compare to the quotes. */
export const NeedsYouCompare: Story = {
  args: { row: needsYouRows.compareQuotes },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('3 quotes to compare')).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Compare' })).toHaveAttribute(
      'href',
      '/tasks/needs-compare?from=tasks#task-quotes',
    )
  },
}

/** Needs you, a reschedule to answer: Respond goes to the booking. */
export const NeedsYouReschedule: Story = {
  args: { row: needsYouRows.answerReschedule },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByText('Priya Shah wants to move the booking'),
    ).toBeVisible()
    const respond = canvas.getByRole('link', { name: 'Respond' })
    await expect(respond).toHaveAttribute(
      'href',
      '/tasks/needs-reschedule?from=tasks#task-order',
    )
    // The button doesn't also open the card.
    respond.addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(respond)
    await expect(args.onOpen).not.toHaveBeenCalled()
  },
}

/** Needs you, the job time has started: Mark done. */
export const NeedsYouMarkDone: Story = {
  args: { row: needsYouRows.markDone },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Mark done' }),
    ).toBeVisible()
  },
}

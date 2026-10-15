import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { PublicProfileAchievements } from './PublicProfileAchievements'
import {
  STORY_NOW,
  sampleOwnerProfile,
  sampleOwnerWithBothRoles,
} from './publicProfileStoryFixture'

/**
 * Owner-only "Your activity" block: agreed totals per role, a month calendar
 * or year grid of completed jobs, and a searchable work history. The clock is
 * fixed to 20 September 2026 so the ranges are the same every day.
 */
const meta = {
  title: 'Public profile/PublicProfileAchievements',
  component: PublicProfileAchievements,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    view: sampleOwnerProfile(STORY_NOW),
    now: STORY_NOW,
  },
} satisfies Meta<typeof PublicProfileAchievements>

export default meta
type Story = StoryObj<typeof meta>

/** This month: the worker panel, a September calendar with two completed days, and two history rows. */
export const Default: Story = {}

/** Worker and customer panels side by side for someone who works and hosts. */
export const BothRoles: Story = {
  args: { view: sampleOwnerWithBothRoles(STORY_NOW) },
}

/** "Last month" selected: the August calendar and its two jobs. */
export const LastMonth: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const pill = await canvas.findByRole('button', { name: 'Last month' })
    await userEvent.click(pill)
    await expect(pill).toHaveAttribute('aria-pressed', 'true')
    await expect(await canvas.findByText('Replace a kitchen tap')).toBeVisible()
  },
}

/** "This year" selected: twelve month tiles with job counts instead of a calendar. */
export const YearView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const pill = await canvas.findByRole('button', { name: 'This year' })
    await userEvent.click(pill)
    await expect(pill).toHaveAttribute('aria-pressed', 'true')
    await expect(
      await canvas.findByText('Fit a flat-pack kitchen'),
    ).toBeVisible()
  },
}

/** A search that matches nothing: "No completed jobs in this view." */
export const NoMatches: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByLabelText('Search completed work'),
      'welding',
    )
    await expect(
      await canvas.findByText('No completed jobs in this view.'),
    ).toBeVisible()
  },
}

/** New account with nothing completed: no activity panel and an empty history. */
export const NoActivity: Story = {
  args: {
    view: {
      ...sampleOwnerProfile(STORY_NOW),
      achievements: [],
      workHistory: [],
    },
  },
}

/** Phone: the calendar and history use the full width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

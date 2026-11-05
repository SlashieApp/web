import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import {
  expectWindowWidth,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'

import { loadError } from '../../views/loadError'
import { unavailable } from '../../views/unavailable'
import {
  PublicProfileSkeleton,
  PublicProfileStatus,
} from './PublicProfileStatus'

/**
 * The profile's status screens: it could not load (Try again), or there is no
 * public profile (Back to search). The shared StatusCard, centred in the page
 * container and 448 wide like every status card (R6). The retired
 * `/workers/[slug]` page shows the same error screen.
 */
const meta = {
  title: 'Public profile/PublicProfileStatus',
  component: PublicProfileStatus,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { config: loadError, onRetry: fn() },
} satisfies Meta<typeof PublicProfileStatus>

export default meta
type Story = StoryObj<typeof meta>

const cardOf = (canvasElement: HTMLElement, name: RegExp) =>
  within(canvasElement).getByRole('region', { name })

/** The profile could not load; Try again refetches. */
export const LoadError: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', {
        name: 'Could not load this profile',
      }),
    ).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    await expect(args.onRetry).toHaveBeenCalled()
  },
}

/** Without a retry callback (the retired worker page) the error screen has no button. */
export const LoadErrorWithoutRetry: Story = {
  args: { onRetry: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Could not load this profile' })
    await expect(canvas.queryByRole('button')).toBeNull()
  },
}

/** Private, suspended, deleted or unknown: one way forward. */
export const Unavailable: Story = {
  args: { config: unavailable },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Back to search',
      }),
    ).toHaveAttribute('href', '/search')
  },
}

/** R6 at 1024, 1366 and 1920: centred in the window, 448 wide (it was a 512 card). */
export const Desktop1024: Story = {
  ...viewportAt(1024),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Try again' })
    expectWindowWidth(canvasElement, 1024)
    expectCentredCardBox(
      canvasElement,
      cardOf(canvasElement, /could not load/i),
      'load error',
    )
  },
}

export const Wide1366: Story = {
  ...viewportAt(1366),
  args: { config: unavailable },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Back to search' })
    expectWindowWidth(canvasElement, 1366)
    expectCentredCardBox(
      canvasElement,
      cardOf(canvasElement, /profile unavailable/i),
      'unavailable',
    )
  },
}

export const Wide1920: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Try again' })
    expectWindowWidth(canvasElement, 1920)
    expectCentredCardBox(
      canvasElement,
      cardOf(canvasElement, /could not load/i),
      'load error',
    )
  },
}

/** Phone: the card fills the container (the window less the 16 gutters). */
export const Phone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Try again' })
    expectWindowWidth(canvasElement, 390)
    expectCentredCardBox(
      canvasElement,
      cardOf(canvasElement, /could not load/i),
      'load error',
    )
  },
}

/** First load: the hero and two sections in outline. */
export const Skeleton: StoryObj = {
  render: () => <PublicProfileSkeleton />,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Loading profile'),
    ).toBeInTheDocument()
  },
}

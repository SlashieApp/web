import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import {
  boxOf,
  expectPx,
  expectWindowWidth,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'
import { Button } from '@ui'

import { AuthCard } from './AuthCard'
import { AuthShell } from './AuthShell'

/** Every auth page: logo, one centred column, and the legal links. */
const meta = {
  title: 'Auth/Parts/AuthShell',
  component: AuthShell,
  parameters: { layout: 'fullscreen' },
  args: {
    children: (
      <AuthCard title="Log in to Slashie" description="Welcome back.">
        <Button w="full">Log in</Button>
      </AuthCard>
    ),
  },
} satisfies Meta<typeof AuthShell>

export default meta
type Story = StoryObj<typeof meta>

/**
 * R6: the auth column is the status card width (448) centred in the container,
 * the same as every status card, and its edges are the card's edges (the card
 * is framed from lg; below, it is flush). On a phone it is the container.
 */
function expectAuthColumn(canvasElement: HTMLElement, width: number) {
  const column = within(canvasElement).getByRole('main')
  expectCentredCardBox(canvasElement, column, 'auth column')
  expectPx(boxOf(column).width, width, 'auth column width')
}

/** Desktop: the card in the middle, legal links at the bottom. */
export const Desktop: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expectWindowWidth(canvasElement, 1366)
    expect(canvas.getByRole('link', { name: 'Slashie home' })).toBeVisible()
    // Not Log in's page, so there is always a way back (FE-445).
    expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible()
    await canvas.findByRole('link', { name: 'Terms' })
    await canvas.findByRole('link', { name: 'Privacy' })
    await canvas.findByRole('link', { name: 'Contact' })
    expectAuthColumn(canvasElement, 448)
  },
}

/** lg: the card is framed and 448 wide, as on a wider screen. */
export const Lg: Story = {
  ...viewportAt(1024),
  play: ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1024)
    expectAuthColumn(canvasElement, 448)
  },
}

/** Tablet: the same 448 column, flush (no frame below lg). */
export const Tablet: Story = {
  ...viewportAt(820),
  play: ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 820)
    expectAuthColumn(canvasElement, 448)
  },
}

/** Wide window: still 448 and centred, never stretched to the 80rem container. */
export const Wide: Story = {
  ...viewportAt(1920),
  play: ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1920)
    expectAuthColumn(canvasElement, 448)
  },
}

/** Phone: the same column, edge to edge with page gutters (358 at 390), and the way back at the logo's left. */
export const Phone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 390)
    expect(
      within(canvasElement).getByRole('button', { name: 'Back' }),
    ).toBeVisible()
    expectAuthColumn(canvasElement, 358)
  },
}

import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { expectGateCard } from '@/app/(stepflow)/stepFlowPageRules.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf, hitExtent } from '@/ui/FormField/formGap.testing'
import { expectPx, viewportAt } from '@/ui/PageContainer/pageLines.testing'
import { Button } from '@ui'

import { TaskQuoteGateView } from './TaskQuoteGateView'

const meta = {
  title: 'Quote flow/TaskQuoteGateView',
  component: TaskQuoteGateView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Send quote',
    description: 'Sign in to send a quote for this task.',
    backHref: '/tasks/example',
    children: <Button w="full">Log in</Button>,
  },
} satisfies Meta<typeof TaskQuoteGateView>

export default meta
type Story = StoryObj<typeof meta>

/** Signed out: Back to task on top of the card, a short explanation and one action. */
export const SignInRequired: Story = {}

/** No back link: the title and action only. */
export const WithoutBackLink: Story = {
  args: { backHref: undefined },
}

/** Long title and explanation wrap without breaking the layout. */
export const LongCopy: Story = {
  args: {
    title: 'Verify your email before you can send quotes on this task',
    description:
      "You've used this month's free tasks. Upgrade to quote more tasks. Quotes you've already sent stay editable, and you can still message customers who have replied.",
  },
}

/** Phones: the card is the width of the window less the gutters. */
export const Mobile: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    expectGateCard(canvasElement, 390)
  },
}

/**
 * R6: a gate is the centred status card, 448 wide, centred in the window at
 * every width (the auth card and the other status cards are the same).
 */
export const CardTablet: Story = {
  ...viewportAt(820),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    expectGateCard(canvasElement, 820)
  },
}

export const CardDesktop: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    expectGateCard(canvasElement, 1366)
  },
}

export const CardDesktopWide: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    expectGateCard(canvasElement, 1920)
  },
}

/**
 * Form spacing (FE-481): the title, the description 8 under it, the first block
 * 24 under that, and the blocks of the column (the summary card, the action) 20
 * apart. The way back to the task is the first line of the card, above the
 * title; the action is 48 tall.
 */
export const Spacing: Story = {
  args: {
    children: (
      <>
        <Box h="72px" borderWidth="1px" borderRadius="md">
          Summary
        </Box>
        <Button w="full" size="form">
          Log in
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { level: 1 })
    const description = canvas.getByText(/Sign in to send a quote/)
    const summary = canvas.getByText('Summary')
    const action = canvas.getByRole('button', { name: 'Log in' })

    await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(description, summary)).toBe(formSpace.headerToBody)
    await expect(gapBelow(summary, action)).toBe(formSpace.fieldGap)
    await expect(heightOf(action)).toBe(formSpace.controlHeight)
    await expectBackLinkAboveTitle(canvasElement)
  },
}

/**
 * Back to task is above the title, left-aligned at the card's content edge, a
 * 44px target, and its text is 24 above the title (as before FE-493 and as the
 * app has it): the 44 box is 12 above the title, the text sits in its middle.
 */
async function expectBackLinkAboveTitle(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const link = canvas.getByRole('link', { name: /back/i })
  const title = canvas.getByRole('heading', { level: 1 })
  const card = canvas.getByRole('region', { name: title.textContent ?? '' })
  await expect(link).toBeVisible()
  await expect(link.getBoundingClientRect().bottom).toBeLessThan(
    title.getBoundingClientRect().top,
  )
  await expect(heightOf(link)).toBe(44)
  await expect(hitExtent(link).height).toBeGreaterThanOrEqual(44)
  const padding = Number.parseFloat(getComputedStyle(card).paddingLeft)
  expectPx(
    link.getBoundingClientRect().left,
    card.getBoundingClientRect().left + padding,
    'the link is left-aligned on the card content',
  )
  // The text's line box sits in the middle of the 44px box.
  const rect = link.getBoundingClientRect()
  const lineHeight = Number.parseFloat(getComputedStyle(link).lineHeight)
  const textBottom = rect.top + rect.height / 2 + lineHeight / 2
  expectPx(
    title.getBoundingClientRect().top - textBottom,
    formSpace.headerToBody,
    'the link text is 24 above the title',
  )
  // The card is still the one centred 448 card.
  expectGateCard(canvasElement, window.innerWidth)
}

/** Phone: the same, in the card at 390. */
export const BackLinkAboveTitlePhone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    await expectBackLinkAboveTitle(canvasElement)
  },
}

/** Without a back link the card is the title, the description and the action. */
export const SpacingWithoutBackLink: Story = {
  args: { backHref: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { level: 1 })
    const description = canvas.getByText(/Sign in to send a quote/)
    const action = canvas.getByRole('button', { name: 'Log in' })
    await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(description, action)).toBe(formSpace.headerToBody)
    await expect(canvas.queryByRole('link', { name: /back/i })).toBeNull()
  },
}

import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'
import { Button } from '@ui'

import { TaskQuoteGateView } from './TaskQuoteGateView'

const meta = {
  title: 'Quote flow/TaskQuoteGateView',
  component: TaskQuoteGateView,
  parameters: {
    layout: 'padded',
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

/** Signed out: a back link, a short explanation and one action. */
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

/** Phones: smaller heading and tighter padding. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

/**
 * Form spacing (FE-481): the title, the description 8 under it, the first block
 * 24 under that, and the blocks of the column (the summary card, the action) 20
 * apart. The back link is 24 above the title; the action is 48 tall.
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
    const header = title.parentElement as HTMLElement
    const description = title.nextElementSibling as HTMLElement
    const column = header.nextElementSibling as HTMLElement
    const back = canvas.getByRole('link', { name: /back/i })
    const [summary, action] = [...column.children] as HTMLElement[]

    await expect(gapBelow(back, title)).toBe(formSpace.headerToBody)
    await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(description, summary as HTMLElement)).toBe(
      formSpace.headerToBody,
    )
    await expect(gapBelow(summary as HTMLElement, action as HTMLElement)).toBe(
      formSpace.fieldGap,
    )
    await expect(heightOf(action as HTMLElement)).toBe(formSpace.controlHeight)
  },
}

/** Without a back link the title is the first thing in the column. */
export const SpacingWithoutBackLink: Story = {
  args: { backHref: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { level: 1 })
    const description = title.nextElementSibling as HTMLElement
    const column = (title.parentElement as HTMLElement)
      .nextElementSibling as HTMLElement
    await expect(gapBelow(title, description)).toBe(formSpace.titleToSubtitle)
    await expect(
      gapBelow(description, column.firstElementChild as Element),
    ).toBe(formSpace.headerToBody)
  },
}

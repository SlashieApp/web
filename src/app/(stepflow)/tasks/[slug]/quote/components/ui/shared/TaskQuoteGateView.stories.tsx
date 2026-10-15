import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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

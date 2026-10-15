import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { TaskDetailSplitCta } from './TaskDetailSplitCta'

/** Text half joined to the primary action, read as one control. */
const meta = {
  title: 'Task detail/Parts/TaskDetailSplitCta',
  component: TaskDetailSplitCta,
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Budget',
    value: '£500',
    meta: 'Fixed price · Cash',
    action: { href: '#quote', label: 'Send a quote' },
  },
} satisfies Meta<typeof TaskDetailSplitCta>

export default meta
type Story = StoryObj<typeof meta>

/** The action navigates: a link joined to the budget. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('link', { name: 'Send a quote' })
  },
}

/** The action runs in place (for example, download the receipt): a button. */
export const ButtonAction: Story = {
  args: { action: { label: 'Get receipt', onClick: fn() } },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Get receipt' }),
    )
    await expect(args.action?.onClick).toHaveBeenCalledOnce()
  },
}

/** Information only: no action half. */
export const NoAction: Story = {
  args: { action: undefined },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('link')).toBeNull()
  },
}

/** No meta line: just the label and the figure. */
export const NoMeta: Story = {
  args: { meta: undefined },
}

/** Contact details can be long: the meta line wraps rather than clips. */
export const LongMeta: Story = {
  args: {
    eyebrow: 'Your customer',
    value: 'Alex Chen',
    meta: '+44 7700 900123 · alexandra.chen.long.address@example-mail-provider.co.uk',
    action: { href: '/messages', label: 'Message' },
  },
  decorators: [
    (Story) => (
      <Box maxW="460px">
        <Story />
      </Box>
    ),
  ],
}

/** Compact pin: stretches across the phone width. */
export const FullWidth: Story = {
  args: { fullWidth: true },
  decorators: [
    (Story) => (
      <Box maxW="390px">
        <Story />
      </Box>
    ),
  ],
}

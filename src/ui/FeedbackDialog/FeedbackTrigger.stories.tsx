import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { FeedbackDialogProvider } from './FeedbackDialogProvider'
import { FeedbackTrigger, type FeedbackTriggerVariant } from './FeedbackTrigger'

const VARIANTS: FeedbackTriggerVariant[] = [
  'button',
  'nav',
  'footer',
  'footerMeta',
]

const meta = {
  title: 'UI/FeedbackDialog/FeedbackTrigger',
  component: FeedbackTrigger,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    onOpened: { control: false },
  },
  args: { variant: 'button', onOpened: fn() },
  // The trigger only opens the dialog that a provider hosts.
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Story />
      </FeedbackDialogProvider>
    ),
  ],
} satisfies Meta<typeof FeedbackTrigger>

export default meta
type Story = StoryObj<typeof meta>

/** Button (default): small ghost button, used in the guest header toolbar. */
export const Button: Story = { args: { variant: 'button' } }

/** Nav: full-width ghost row for menus and drawers (account menu "Send feedback"). */
export const Nav: Story = {
  args: { variant: 'nav' },
  render: (args) => (
    <Box maxW="280px">
      <FeedbackTrigger {...args} />
    </Box>
  ),
}

/** Footer: medium-weight text link in a footer link column. */
export const Footer: Story = { args: { variant: 'footer' } }

/** Footer meta: muted text link in the footer legal row. */
export const FooterMeta: Story = { args: { variant: 'footerMeta' } }

/** Click: opens the feedback dialog through the provider and reports `onOpened`. */
export const OpensDialog: Story = {
  args: { variant: 'button' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Send feedback' }),
    )
    await waitFor(
      () =>
        expect(
          within(canvasElement.ownerDocument.body).getByRole('dialog', {
            name: 'Send feedback',
          }),
        ).toBeVisible(),
      { timeout: 3000 },
    )
    await expect(args.onOpened).toHaveBeenCalledTimes(1)
  },
}

/** Every trigger variant, each under its name. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={5} maxW="280px">
      {VARIANTS.map((variant) => (
        <Stack key={variant} gap={1} align="flex-start">
          <Text fontSize="xs" color="text.muted">
            {variant}
          </Text>
          <FeedbackTrigger variant={variant} />
        </Stack>
      ))}
    </Stack>
  ),
}

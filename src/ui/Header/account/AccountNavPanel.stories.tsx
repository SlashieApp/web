import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { FeedbackDialogProvider } from '../../FeedbackDialog/FeedbackDialogProvider'
import { AccountNavPanel } from './AccountNavPanel'
import { resolveAccountNavItems } from './accountNav.config'

const meta = {
  title: 'Shell/Header/AccountNavPanel',
  component: AccountNavPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    items: { control: false },
    showDividers: { control: 'boolean' },
  },
  args: {
    items: resolveAccountNavItems(true),
    showDividers: true,
    onNavigate: fn(),
    onLogout: fn(),
    onOpenLanguage: fn(),
  },
  // Sized like the desktop account popover; the provider lets "Send feedback" open its dialog.
  decorators: [
    (Story) => (
      <FeedbackDialogProvider onSubmit={async () => true}>
        <Box
          w="300px"
          p={1}
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          boxShadow="e3"
        >
          <Story />
        </Box>
      </FeedbackDialogProvider>
    ),
  ],
} satisfies Meta<typeof AccountNavPanel>

export default meta
type Story = StoryObj<typeof meta>

/** Worker: main links, then Profile, Account, Plan & billing and Earnings, then language, help and Log out. */
export const Worker: Story = {}

/** On /account: the Account row is marked as the current page. */
export const CurrentPage: Story = {
  parameters: { nextjs: { navigation: { pathname: '/account' } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Account' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(
      canvas.getByRole('link', { name: 'Profile' }),
    ).not.toHaveAttribute('aria-current')
  },
}

/** Customer: no worker profile, so "Become a worker" sits where Plan & billing and Earnings would. */
export const Customer: Story = {
  args: { items: resolveAccountNavItems(false) },
}

/** Admin: a Slashie team account also gets the "Send an announcement" link. */
export const Admin: Story = {
  args: { items: resolveAccountNavItems(true, { isAdmin: true }) },
}

/** No dividers: the three groups run together without separator lines. */
export const NoDividers: Story = {
  args: { showDividers: false },
}

/** Language: the Language row calls `onOpenLanguage` and then closes the host. */
export const LanguageRowCallsHandler: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Language' }),
    )
    await expect(args.onOpenLanguage).toHaveBeenCalledTimes(1)
    await expect(args.onNavigate).toHaveBeenCalledTimes(1)
  },
}

/** Log out: the Log out row calls `onLogout` and then closes the host. */
export const LogoutRowCallsHandler: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Log out' }),
    )
    await expect(args.onLogout).toHaveBeenCalledTimes(1)
    await expect(args.onNavigate).toHaveBeenCalledTimes(1)
  },
}

/** Feedback: the Send feedback row opens the feedback dialog and closes the host. */
export const FeedbackRowOpensDialog: Story = {
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
    await expect(args.onNavigate).toHaveBeenCalledTimes(1)
  },
}

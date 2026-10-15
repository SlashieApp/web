import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { FeedbackTrigger } from '../../FeedbackDialog/FeedbackTrigger'
import {
  HeaderGuestAuthButtons,
  HeaderToolbarSeparator,
} from './GuestHeaderAuth'

const meta = {
  title: 'Shell/Header/GuestHeaderAuth',
  component: HeaderGuestAuthButtons,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    loginHref: '/login?next=%2Fsearch',
    signupHref: '/register?next=%2Fsearch',
  },
} satisfies Meta<typeof HeaderGuestAuthButtons>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop: ghost "Log in" and secondary "Sign up" links, as single anchors. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('link', { name: 'Log in' })).toHaveAttribute(
      'href',
      '/login?next=%2Fsearch',
    )
    await expect(canvas.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/register?next=%2Fsearch',
    )
  },
}

/** In the toolbar: the divider and Feedback button that sit before the auth buttons. */
export const InToolbar: Story = {
  render: (args) => (
    <HStack gap={2} align="center">
      <HeaderToolbarSeparator />
      <FeedbackTrigger variant="button" />
      <HeaderGuestAuthButtons {...args} />
    </HStack>
  ),
}

/** Phone: both buttons are hidden below `lg`; the bottom bar's Account item logs in instead. */
export const HiddenOnPhone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => (
    <Stack gap={3}>
      <Text fontSize="sm" color="text.muted">
        Below lg the Log in and Sign up buttons are not rendered. Phones use the
        Account item in the bottom bar, which goes to the login page.
      </Text>
      <HeaderGuestAuthButtons {...args} />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('link', { name: 'Log in' }),
    ).toBeNull()
  },
}

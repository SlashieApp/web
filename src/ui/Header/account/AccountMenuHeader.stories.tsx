import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'

import { AccountMenuHeader } from './AccountMenuHeader'

const meta = {
  title: 'Shell/Header/AccountMenuHeader',
  component: AccountMenuHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    displayName: 'Sam Carter',
    email: 'sam@example.com',
    onViewProfile: fn(),
  },
  // The avatar reads the signed-in profile photo, so start from signed out.
  decorators: [
    (Story) => {
      useUserStore.setState({ user: null, me: null })
      return (
        <Box
          w="300px"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          boxShadow="e3"
          overflow="hidden"
        >
          <Story />
        </Box>
      )
    },
  ],
} satisfies Meta<typeof AccountMenuHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Who is signed in and the way to their Profile; plans stay on Plan & billing. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Sam Carter')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'View profile' }),
    ).toHaveAttribute('href', '/profile')
    await expect(canvas.queryByText('Tasks quoted this month')).toBeNull()
  },
}

/** Long text: a long name and email truncate with an ellipsis instead of wrapping. */
export const LongNameAndEmail: Story = {
  args: {
    displayName: 'Alexandria Montgomery-Featherstonehaugh',
    email:
      'alexandria.montgomery-featherstonehaugh@a-very-long-company-domain.example.com',
  },
}

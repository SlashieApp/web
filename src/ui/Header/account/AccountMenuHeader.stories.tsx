import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'

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

/**
 * The header of the account menu on the form spacing (FE-481 menus): the name
 * and the email are 8 apart, the Profile link is 4 under the email, the block
 * owns the 24 below it (the first row is under that) and draws no rule. It is
 * inset 12 inside its box, as a row's label is.
 */
export const Spacing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const name = canvas.getByText('Sam Carter')
    const email = canvas.getByText('sam@example.com')
    const link = canvas.getByRole('link', { name: 'View profile' })
    await expect(gapBelow(name, email)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(email, link)).toBe(formSpace.controlToHelper)

    const header = canvasElement.querySelector(
      '[data-menu-header]',
    ) as HTMLElement
    const style = getComputedStyle(header)
    await expect(style.marginBottom).toBe(`${formSpace.headerToBody}px`)
    await expect(style.borderBottomWidth).toBe('0px')
    await expect(style.borderTopWidth).toBe('0px')

    const box = header.getBoundingClientRect()
    const avatar = (
      header.firstElementChild as HTMLElement
    ).getBoundingClientRect()
    await expect(avatar.top - box.top).toBe(12)
    await expect(avatar.left - box.left).toBe(12)
    // The block ends at the link: nothing under it but the 24 it owns.
    await expect(Math.round(box.bottom)).toBe(
      Math.round(link.getBoundingClientRect().bottom),
    )
  },
}

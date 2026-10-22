import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuInfo, LuUser } from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import { Button, Link } from '@ui'

import { DashboardPageLayout } from './DashboardPageLayout'
import { DashboardSectionCard } from './DashboardSectionCard'

const body = (
  <>
    <DashboardSectionCard
      title="Contact"
      description="How Slashie reaches you."
      icon={<LuUser size={18} aria-hidden />}
    >
      <Text fontSize="sm" color="text.muted">
        Main column content.
      </Text>
    </DashboardSectionCard>
    <DashboardSectionCard
      title="Sign-in and security"
      description="How you sign in."
      icon={<LuInfo size={18} aria-hidden />}
    >
      <Text fontSize="sm" color="text.muted">
        More main column content.
      </Text>
    </DashboardSectionCard>
  </>
)

const sidebar = (
  <DashboardSectionCard title="Visibility" description="Who can find you.">
    <Stack gap={2}>
      <Link href="/profile">Profile</Link>
    </Stack>
  </DashboardSectionCard>
)

const meta = {
  title: 'Dashboard/Shared/DashboardPageLayout',
  component: DashboardPageLayout,
  parameters: { layout: 'padded' },
  args: {
    title: 'Account',
    description: 'Email, phone and sign-in.',
    children: body,
  },
} satisfies Meta<typeof DashboardPageLayout>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop: one readable column, the title is the h1 and there is no back button. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Account' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Go back' })).toBeNull()
  },
}

/** One button beside the title. */
export const WithAction: Story = {
  args: { action: <Button size="sm">Edit profile</Button> },
}

/** A wide page with a rail beside the body. */
export const WideWithSidebar: Story = {
  args: { width: 'wide', title: 'Profile', sidebar },
}

/** A hero or notice between the header and the body. */
export const WithAfterHeader: Story = {
  args: {
    afterHeader: (
      <Text fontSize="sm" p={4} bg="status.success.soft" borderRadius="lg">
        Content between the header and the body (hero, notices).
      </Text>
    ),
  },
}

/** Phones: there is no app header, so the page header has Back. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
  },
}

/** Phones: the rail stacks under the body. */
export const PhoneSidebarStacked: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { width: 'wide', title: 'Profile', sidebar },
}

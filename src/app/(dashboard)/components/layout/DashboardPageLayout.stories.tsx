import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuInfo, LuUser } from 'react-icons/lu'

import { Button, Link } from '@ui'

import { DashboardPageLayout } from './DashboardPageLayout'
import { DashboardSectionCard } from './DashboardSectionCard'

const sections = [
  { label: 'Overview', href: '#overview' },
  { label: 'Contact', href: '#contact' },
  { label: 'Security', href: '#security' },
]

const body = (
  <>
    <DashboardSectionCard
      title="Contact methods"
      description="How Slashie reaches you."
      icon={<LuUser size={18} aria-hidden />}
    >
      <Text fontSize="sm" color="text.muted">
        Main column content.
      </Text>
    </DashboardSectionCard>
    <DashboardSectionCard
      title="Security"
      description="Sign-in and password."
      icon={<LuInfo size={18} aria-hidden />}
    >
      <Text fontSize="sm" color="text.muted">
        More main column content.
      </Text>
    </DashboardSectionCard>
  </>
)

const sidebar = (
  <DashboardSectionCard title="Related" description="Other account areas.">
    <Stack gap={2}>
      <Link href="/profile">Profile</Link>
      <Link href="/billing">Billing</Link>
    </Stack>
  </DashboardSectionCard>
)

const meta = {
  title: 'Dashboard/Shared/DashboardPageLayout',
  component: DashboardPageLayout,
  parameters: { layout: 'padded' },
  args: {
    eyebrow: 'Account',
    title: 'Account & security',
    description: 'Login, security and contact settings.',
    children: <Stack gap={4}>{body}</Stack>,
  },
} satisfies Meta<typeof DashboardPageLayout>

export default meta
type Story = StoryObj<typeof meta>

/** Header and a full-width body. */
export const Default: Story = {}

/** Actions sit to the right of the title. */
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button size="sm" variant="secondary">
          Browse tasks
        </Button>
        <Button size="sm">Post a task</Button>
      </>
    ),
  },
}

/** Section links under the header, the second one active. */
export const WithSectionNav: Story = {
  args: { sections, activeSectionHref: '#contact' },
}

/** Body plus a sidebar, side by side on large screens. */
export const WithSidebar: Story = {
  args: { sidebar },
}

/** Banners above the nav and between the nav and the body. */
export const WithBanners: Story = {
  args: {
    sections,
    afterHeader: (
      <Text fontSize="sm" p={4} bg="status.success.soft" borderRadius="lg">
        Content between the header and the section nav (hero, banners).
      </Text>
    ),
    afterNav: (
      <Text fontSize="sm" color="status.danger.fg" role="alert">
        Content between the nav and the body (notices, errors).
      </Text>
    ),
  },
}

/** Phones: the sidebar stacks under the body. */
export const PhoneSidebarStacked: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { sections, sidebar },
}

/** Phones: a desktop-only sidebar is hidden. */
export const PhoneSidebarHidden: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { sections, sidebar, sidebarOnMobile: false },
}

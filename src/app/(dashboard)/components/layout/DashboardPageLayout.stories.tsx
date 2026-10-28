import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'
import { LuInfo, LuUser } from 'react-icons/lu'
import { expect, waitFor, within } from 'storybook/test'

import { Link } from '@ui'

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

/** Desktop: one readable column, the title is the h1, with Back above it at every width. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Account' }),
    ).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
  },
}

/** A wide page with a rail beside the body. */
export const WideWithSidebar: Story = {
  args: { width: 'wide', title: 'Profile', sidebar },
}

/** A hero or notice between the header and the body. */
export const WithAfterHeader: Story = {
  args: {
    afterHeader: (
      <Text fontSize="sm" p={4} bg="bg.subtle" borderRadius="lg">
        Content between the header and the body (hero, notices).
      </Text>
    ),
  },
}

/** Phones: the same bar, with Back. */
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

/** Story-only scroll pane, as the app shell's `main`; `scrolled` starts it past the title. */
function Pane({
  scrolled = false,
  children,
}: {
  scrolled?: boolean
  children: ReactNode
}) {
  return (
    <Box
      ref={(node: HTMLDivElement | null) => {
        if (!node || !scrolled) return
        requestAnimationFrame(() => {
          node.scrollTop = 200
        })
      }}
      h="420px"
      overflowY="auto"
      overflowX="clip"
      bg="bg.subtle"
      px={6}
    >
      {children}
      <Box h="1200px" />
    </Box>
  )
}

/** The bar's one-line copy: the one copy of the title that is not the h1. */
const barTitle = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-sticky-header-bar-title]') as HTMLElement

/**
 * Account and Billing: the page header, Back in the bar at every width, the
 * big title is the h1 and the description is under it. The bar's copy is
 * hidden from screen readers and from sight.
 */
export const Header: Story = {
  render: (args) => (
    <Pane>
      <DashboardPageLayout {...args} />
    </Pane>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Account' }),
    ).toBeVisible()
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
    await expect(
      barTitle(canvasElement).closest('[aria-hidden="true"]'),
    ).not.toBeNull()
    await expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('0')
  },
}

/** Scrolled: the title has collapsed into the bar, beside Back. */
export const HeaderScrolled: Story = {
  render: (args) => (
    <Pane scrolled>
      <DashboardPageLayout {...args} />
    </Pane>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(getComputedStyle(barTitle(canvasElement)).opacity).toBe('1'),
    )
    await expect(
      within(canvasElement).getByRole('button', { name: 'Go back' }),
    ).toBeVisible()
    await expect(
      within(canvasElement).getAllByRole('heading', { level: 1 }),
    ).toHaveLength(1)
  },
}

/** Phones: the same bar, the title wraps in the one column. */
export const HeaderPhone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  render: (args) => (
    <Pane>
      <DashboardPageLayout {...args} />
    </Pane>
  ),
}

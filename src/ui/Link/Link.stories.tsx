import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button'
import { Link } from './Link'

const meta = {
  title: 'ui/Link',
  component: Link,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Link>

export default meta

type Story = StoryObj<typeof meta>

export const FooterPricing: Story = {
  render: () => (
    <Link href="/pricing" fontWeight={600} fontSize="sm" color="cardFg">
      Pricing
    </Link>
  ),
}

export const AccountViewProfile: Story = {
  render: () => (
    <Link href="/profile" tone="emphasis" fontSize="xs" fontWeight={600}>
      View profile
    </Link>
  ),
}

export const AccountManageBilling: Story = {
  render: () => (
    <Link href="/billing" tone="emphasis" fontSize="xs" fontWeight={600}>
      Manage billing
    </Link>
  ),
}

export const TaskDetailBackToBrowse: Story = {
  render: () => (
    <Link href="/" tone="muted" fontSize="sm" color="formLabelMuted">
      Back to browse
    </Link>
  ),
}

export const WrapsPostTaskButton: Story = {
  render: () => (
    <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
      <Button variant="primary" size="sm">
        Post a task
      </Button>
    </Link>
  ),
}

export const ExternalHelpCenter: Story = {
  render: () => (
    <Link
      href="https://slashie.app"
      target="_blank"
      rel="noopener noreferrer"
      fontSize="sm"
      fontWeight={600}
    >
      Help Center
    </Link>
  ),
}

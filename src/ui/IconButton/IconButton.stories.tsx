import { HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { IconButton } from './IconButton'

function BrowseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Browse</title>
      <path
        d="M12 4 7 7l-2 5 2 5 5 3 5-3 2-5-2-5-5-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Notifications</title>
      <path
        d="M12 3a5 5 0 0 0-5 5v2.5c0 .6-.2 1.2-.6 1.7L5 14.5V16h14v-1.5l-1.4-2.3c-.4-.5-.6-1.1-.6-1.7V8a5 5 0 0 0-5-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

const meta = {
  title: 'ui/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

export const DockBrowseActive: Story = {
  render: () => (
    <IconButton href="/" icon={<BrowseIcon />} caption="Browse" active />
  ),
}

export const DockRequests: Story = {
  render: () => (
    <IconButton href="/requests" icon={<BrowseIcon />} caption="Requests" />
  ),
}

export const DockNavRow: Story = {
  render: () => (
    <HStack gap={2}>
      <IconButton href="/" icon={<BrowseIcon />} caption="Browse" active />
      <IconButton href="/requests" icon={<BrowseIcon />} caption="Requests" />
    </HStack>
  ),
}

export const HeaderNotifications: Story = {
  render: () => (
    <IconButton type="button" variant="ghost" aria-label="Notifications">
      <BellIcon />
    </IconButton>
  ),
}

export const HeaderCloseDrawer: Story = {
  render: () => (
    <IconButton type="button" variant="ghost" aria-label="Close menu">
      ×
    </IconButton>
  ),
}

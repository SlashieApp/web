import { HStack, Stack } from '@chakra-ui/react'
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

/**
 * SDL IconButton. Renders either a dock-style nav link (`href` + `icon`) or a
 * standalone ghost action (Chakra `IconButton`). Both keep a visible focus ring
 * and meet the 44px touch target. Stories render under both light and dark via
 * the global theme toolbar — nothing here hardcodes a mode.
 */
const meta = {
  title: 'ui/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'solid', 'outline'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    'aria-label': { control: 'text' },
  },
  args: {
    variant: 'ghost',
    'aria-label': 'Notifications',
    children: <BellIcon />,
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

/** Standalone ghost action. Tab to it to see the SDL focus ring. */
export const Playground: Story = {}

/** Default ghost action with its required aria-label. */
export const Default: Story = {
  args: { 'aria-label': 'Notifications', children: <BellIcon /> },
}

export const Disabled: Story = {
  args: {
    'aria-label': 'Notifications',
    disabled: true,
    children: <BellIcon />,
  },
}

export const Loading: Story = {
  args: {
    'aria-label': 'Notifications',
    loading: true,
    children: <BellIcon />,
  },
}

/** Focusable example — Tab in to verify the 2px ring + offset. */
export const Focus: Story = {
  args: { 'aria-label': 'Notifications', children: <BellIcon /> },
}

/** Dock nav tile in its active (selected route) state. */
export const NavActive: Story = {
  render: () => (
    <IconButton href="/" icon={<BrowseIcon />} caption="Browse" active />
  ),
}

/** Dock nav tile in its resting (inactive) state. */
export const NavInactive: Story = {
  render: () => (
    <IconButton href="/requests" icon={<BrowseIcon />} caption="Requests" />
  ),
}

/** Overview of every shape and state side by side. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6}>
      <Stack gap={2}>
        <HStack gap={3} alignItems="center">
          <IconButton type="button" variant="ghost" aria-label="Notifications">
            <BellIcon />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            aria-label="Notifications"
            disabled
          >
            <BellIcon />
          </IconButton>
          <IconButton
            type="button"
            variant="ghost"
            aria-label="Notifications"
            loading
          >
            <BellIcon />
          </IconButton>
          <IconButton type="button" variant="ghost" aria-label="Close menu">
            ×
          </IconButton>
        </HStack>
      </Stack>

      <HStack gap={2} alignItems="center">
        <IconButton href="/" icon={<BrowseIcon />} caption="Browse" active />
        <IconButton href="/requests" icon={<BrowseIcon />} caption="Requests" />
        <IconButton href="/alerts" icon={<BellIcon />} caption="Alerts" />
      </HStack>
    </Stack>
  ),
}

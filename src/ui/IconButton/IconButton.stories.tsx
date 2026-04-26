import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { IconButton } from './IconButton'

function DiscoveryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Discovery</title>
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

const meta = {
  title: 'ui/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    href: '/',
    icon: <DiscoveryIcon />,
    caption: 'Discovery',
    active: false,
  },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = {
  args: {
    active: true,
  },
}

export const IconOnly: Story = {
  args: {
    caption: undefined,
  },
}

/** Chakra-style `IconButton` (no `href` / `icon`); same path as `ColorModeButton`. */
export const ChakraGhost: Story = {
  render: () => (
    <IconButton
      type="button"
      variant="ghost"
      size="sm"
      aria-label="Example action"
    >
      <DiscoveryIcon />
    </IconButton>
  ),
}

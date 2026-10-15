import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'

import { Button } from '../Button/Button'
import { StickyHeader } from './StickyHeader'

const meta: Meta<typeof StickyHeader> = {
  title: 'UI/StickyHeader',
  component: StickyHeader,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Edit task',
    description:
      'Update your task details below. Changes are visible to nearby workers right away.',
    backLabel: 'Back',
    backAriaLabel: 'Go back',
    onBack: () => {},
    action: ({ isStuck }) => (
      <Button type="button" size={isStuck ? 'sm' : 'md'}>
        Save changes
      </Button>
    ),
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Scroll the pane to see the header stick and compact. */
export const Default: Story = {
  render: (args) => (
    <Box h="420px" overflowY="auto" overflowX="clip" bg="bg.canvas" px={6}>
      <StickyHeader {...args} />
      <Text color="text.muted" h="1200px" pt={4}>
        Page content
      </Text>
    </Box>
  ),
}

/** Pane starts scrolled so the header is already stuck. */
export const Stuck: Story = {
  render: (args) => (
    <Box
      ref={(node: HTMLDivElement | null) => {
        if (!node) return
        requestAnimationFrame(() => {
          node.scrollTop = 240
        })
      }}
      h="420px"
      overflowY="auto"
      overflowX="clip"
      bg="bg.canvas"
      px={6}
    >
      <StickyHeader {...args} />
      <Text color="text.muted" h="1200px" pt={4}>
        Page content
      </Text>
    </Box>
  ),
}

/** Title only: no back control, description, or action. */
export const TitleOnly: Story = {
  args: {
    onBack: undefined,
    description: undefined,
    action: undefined,
  },
  render: (args) => (
    <Box bg="bg.canvas" px={6}>
      <StickyHeader {...args} />
    </Box>
  ),
}

/** Story-only scroll pane; `scrolled` starts it past the header's sentinel. */
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
          node.scrollTop = 240
        })
      }}
      h="420px"
      overflowY="auto"
      overflowX="clip"
      bg="bg.canvas"
      px={6}
    >
      {children}
      <Text color="text.muted" h="1200px" pt={4}>
        Page content
      </Text>
    </Box>
  )
}

const LONG_TITLE =
  'Replace the cracked bathroom tiles and re-grout the shower tray in the upstairs flat'

/** Without back: no back control, so the title starts at the left edge. */
export const WithoutBack: Story = {
  args: { onBack: undefined },
  render: (args) => (
    <Pane>
      <StickyHeader {...args} />
    </Pane>
  ),
}

/** Without description: title and action only while open. */
export const WithoutDescription: Story = {
  args: { description: undefined },
  render: (args) => (
    <Pane>
      <StickyHeader {...args} />
    </Pane>
  ),
}

/** Without action: back control, title and description only. */
export const WithoutAction: Story = {
  args: { action: undefined },
  render: (args) => (
    <Pane>
      <StickyHeader {...args} />
    </Pane>
  ),
}

/** Long title: wraps over several lines while the header is open. */
export const LongTitle: Story = {
  args: { title: LONG_TITLE },
  render: (args) => (
    <Pane>
      <StickyHeader {...args} />
    </Pane>
  ),
}

/** Phone, stuck, long title: the compact bar truncates it with an ellipsis. */
export const StuckLongTitle: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { title: LONG_TITLE },
  render: (args) => (
    <Pane scrolled>
      <StickyHeader {...args} />
    </Pane>
  ),
}

/** Phone, open: stacked back link, title and description at phone width. */
export const MobileOpen: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => (
    <Pane>
      <StickyHeader {...args} />
    </Pane>
  ),
}

/** Phone, stuck: compact bar with the icon back button and a small action. */
export const MobileStuck: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => (
    <Pane scrolled>
      <StickyHeader {...args} />
    </Pane>
  ),
}

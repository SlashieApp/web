import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '../Button/Button'
import { StickyHeader } from './StickyHeader'

const meta: Meta<typeof StickyHeader> = {
  title: 'ui/StickyHeader',
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

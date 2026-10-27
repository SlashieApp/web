import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'

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
  bg = 'bg.canvas',
  children,
}: {
  scrolled?: boolean
  bg?: 'bg.canvas' | 'bg.subtle'
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
      bg={bg}
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

/** The title bar's small title: the one copy of the title that is not the h1. */
const barTitle = (canvasElement: HTMLElement, title: string) =>
  within(canvasElement).getByText(title, { selector: 'p' })

const isHiddenFromReaders = (node: HTMLElement) =>
  node.closest('[aria-hidden="true"]') !== null

const BAR_ARGS = {
  title: 'Terms of Service',
  description: 'Last updated: 8 July 2026',
  action: undefined,
} as const

/**
 * iPhone title bar, top of the page: Back in the bar, the large title is the
 * page's one h1, and the bar's small title is faded out and hidden from
 * screen readers.
 */
export const LargeTitle: Story = {
  args: { ...BAR_ARGS, variant: 'largeTitle' },
  render: (args) => (
    <Pane bg="bg.subtle">
      <StickyHeader {...args} />
    </Pane>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: args.title }),
    ).toBeVisible()
    await expect(canvas.getAllByRole('heading')).toHaveLength(1)
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
    await expect(isHiddenFromReaders(barTitle(canvasElement, args.title))).toBe(
      true,
    )
  },
}

/**
 * iPhone title bar, scrolled: the large title has gone under the bar, so the
 * small title shows and is read. The h1 is still the only heading.
 */
export const LargeTitleScrolled: Story = {
  args: { ...BAR_ARGS, variant: 'largeTitle' },
  render: (args) => (
    <Pane scrolled bg="bg.subtle">
      <StickyHeader {...args} />
    </Pane>
  ),
  play: async ({ canvasElement, args }) => {
    await waitFor(() =>
      expect(isHiddenFromReaders(barTitle(canvasElement, args.title))).toBe(
        false,
      ),
    )
    await expect(within(canvasElement).getAllByRole('heading')).toHaveLength(1)
    await expect(
      within(canvasElement).getByRole('button', { name: 'Go back' }),
    ).toBeVisible()
  },
}

/** Phone, top: the large title wraps to the page width under the bar. */
export const LargeTitlePhone: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...BAR_ARGS, variant: 'largeTitle', title: LONG_TITLE },
  render: (args) => (
    <Pane bg="bg.subtle">
      <StickyHeader {...args} />
    </Pane>
  ),
}

/** Phone, scrolled: a long small title is cut with an ellipsis, clear of Back. */
export const LargeTitlePhoneScrolled: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { ...BAR_ARGS, variant: 'largeTitle', title: LONG_TITLE },
  render: (args) => (
    <Pane scrolled bg="bg.subtle">
      <StickyHeader {...args} />
    </Pane>
  ),
}

/**
 * Below another sticky header (the marketing header): the bar sticks under it
 * with `stickyTop`, and the small title still shows once the h1 is under the bar.
 */
export const LargeTitleBelowHeader: Story = {
  args: { ...BAR_ARGS, variant: 'largeTitle', stickyTop: '64px' },
  render: (args) => (
    <Pane scrolled bg="bg.subtle">
      <Box
        position="sticky"
        top={0}
        zIndex={20}
        h="64px"
        mx={-6}
        bg="bg.canvas"
        borderBottomWidth="1px"
        borderColor="border.default"
      />
      <StickyHeader {...args} />
    </Pane>
  ),
  play: async ({ canvasElement, args }) => {
    await waitFor(() =>
      expect(isHiddenFromReaders(barTitle(canvasElement, args.title))).toBe(
        false,
      ),
    )
  },
}

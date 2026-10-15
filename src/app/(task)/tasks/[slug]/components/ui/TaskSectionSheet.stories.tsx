import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuChartColumn } from 'react-icons/lu'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { TaskSectionSheet } from './TaskSectionSheet'

/**
 * Phones: a section card (icon, title, one-line summary) that opens its
 * content in a bottom sheet. On web the same content sits open in the rail,
 * so the card is hidden from `lg` up.
 */
const meta = {
  title: 'Task detail/Parts/TaskSectionSheet',
  component: TaskSectionSheet,
  parameters: { layout: 'padded' },
  globals: { viewport: { value: 'mobile1' } },
  args: {
    icon: <LuChartColumn size={18} />,
    title: 'Analytics',
    summary: 'Medium interest',
    children: (
      <Stack gap={2}>
        <Text fontWeight={600}>Views: 12</Text>
        <Text color="text.muted">Quotes: 2</Text>
      </Stack>
    ),
  },
} satisfies Meta<typeof TaskSectionSheet>

export default meta
type Story = StoryObj<typeof meta>

/** The sheet portals to the page, outside the story canvas. */
const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Closed: the card with its icon, title and summary. */
export const Closed: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: /Analytics/ })
    await canvas.findByText('Medium interest')
  },
}

/** Tapping the card opens the content in a bottom sheet. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: /Analytics/ }),
    )
    const sheet = page(canvasElement)
    await sheet.findByRole('dialog')
    await sheet.findByText('Views: 12')
  },
}

/** Opens on first render (for example from an old `#analytics` link). */
export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  play: async ({ canvasElement }) => {
    await page(canvasElement).findByText('Views: 12')
  },
}

/** No summary: the title sits alone beside the icon. */
export const NoSummary: Story = {
  args: { summary: undefined },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByText('Medium interest')).toBeNull()
  },
}

/** A long summary is cut off on one line. */
export const LongSummary: Story = {
  args: {
    summary:
      'Strong interest: several quotes are in, so compare them and accept the worker you like',
  },
}

/** Web: the card is hidden; the same content lives open in the rail. */
export const HiddenOnWeb: Story = {
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        within(canvasElement).queryByRole('button', { name: /Analytics/ }),
      ).toBeNull(),
    )
  },
}

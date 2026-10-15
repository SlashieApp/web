import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { SearchThisAreaButton } from './SearchThisAreaButton'

const meta = {
  title: 'Tasks/SearchThisAreaButton',
  component: SearchThisAreaButton,
  parameters: { layout: 'padded' },
  args: { visible: true, enabled: true, onClick: fn() },
} satisfies Meta<typeof SearchThisAreaButton>

export default meta
type Story = StoryObj<typeof meta>

/** The map was panned: the pill shows, and pressing it searches that area. */
export const Visible: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Search this area' }),
    )
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

/** The map has not moved: nothing to search, so the pill is hidden. */
export const Hidden: Story = {
  args: { visible: false },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}

/** Search is not available yet (the map is still loading): also hidden. */
export const NotEnabled: Story = {
  args: { enabled: false },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}

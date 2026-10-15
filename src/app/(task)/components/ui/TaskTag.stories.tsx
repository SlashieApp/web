import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { browseDatePresetRange } from '../../helpers/taskBrowseHelpers'
import { withTaskBrowseStory } from '../../helpers/taskBrowseStoryDecorator'
import { TaskTag } from './TaskTag'

const meta = {
  title: 'Tasks/TaskTag',
  component: TaskTag,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TaskTag>

export default meta
type Story = StoryObj<typeof meta>

/** No filter applied: the row renders nothing. */
export const NoFilters: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('button')).toBeNull(),
    )
  },
}

/** Only a search is applied: one chip and Clear all. */
export const SearchOnly: Story = {
  decorators: [
    withTaskBrowseStory({ initialState: { searchText: 'chandelier' } }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: /Remove .chandelier. filter/ })
    await canvas.findByRole('button', { name: 'Clear all' })
  },
}

/** Search, date and budget are all applied: one removable chip each. */
export const AllFilters: Story = {
  decorators: [
    withTaskBrowseStory({
      initialState: { searchText: 'chandelier' },
      dateFilter: browseDatePresetRange('week'),
      budget: { min: '50', max: '200' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Remove This week filter' })
    // The budget applies after the typing pause.
    await canvas.findByRole('button', { name: 'Remove £50 – £200 filter' })
  },
}

/** Clear all removes every chip, and the row disappears. */
export const ClearAll: Story = {
  decorators: [
    withTaskBrowseStory({
      initialState: { searchText: 'chandelier' },
      dateFilter: browseDatePresetRange('today'),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Clear all' }),
    )
    await waitFor(() =>
      expect(canvasElement.querySelector('button')).toBeNull(),
    )
  },
}

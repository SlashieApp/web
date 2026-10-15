import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { browseDatePresetRange } from '../../helpers/taskBrowseHelpers'
import { withTaskBrowseStory } from '../../helpers/taskBrowseStoryDecorator'
import { TaskSearchFilters } from './TaskSearchFilters'

const meta = {
  title: 'Tasks/TaskSearchFilters',
  component: TaskSearchFilters,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskSearchFilters>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing applied: the Date and Budget chips, both closed. */
export const Default: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Date' })
    await canvas.findByRole('button', { name: 'Budget' })
  },
}

/** The Date chip is open: Today, This week and Pick dates. */
export const DatePanel: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Date' }))
    await canvas.findByRole('button', { name: 'Today' })
    await canvas.findByRole('button', { name: 'This week' })
  },
}

/** Pick dates: the From and To date fields appear. */
export const PickDates: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Date' }))
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Pick dates' }),
    )
    await canvas.findByLabelText('From')
    await canvas.findByLabelText('To')
  },
}

/** The Budget chip is open: Min and Max pound fields. */
export const BudgetPanel: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Budget' }))
    await canvas.findByLabelText('Min (£)')
    await canvas.findByLabelText('Max (£)')
  },
}

/** A minimum above the maximum: the panel explains why nothing is applied. */
export const BudgetInvalid: Story = {
  decorators: [withTaskBrowseStory()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: 'Budget' }))
    await userEvent.type(await canvas.findByLabelText('Min (£)'), '200')
    await userEvent.type(await canvas.findByLabelText('Max (£)'), '50')
    expect(await canvas.findByRole('alert')).toHaveTextContent(
      'The minimum is above the maximum.',
    )
  },
}

/** A custom date range: the chip shows the range and the panel has both days. */
export const CustomDateRange: Story = {
  decorators: [
    withTaskBrowseStory({
      dateFilter: { preset: 'custom', from: '2030-06-10', to: '2030-06-20' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('button', { name: /10 Jun/ }))
    expect(await canvas.findByLabelText('From')).toHaveValue('2030-06-10')
    expect(canvas.getByLabelText('To')).toHaveValue('2030-06-20')
  },
}

/** Date and Budget applied: the chips turn green with an ×, plus Clear all. */
export const WithActiveFilters: Story = {
  decorators: [
    withTaskBrowseStory({
      dateFilter: browseDatePresetRange('week'),
      budget: { min: '50', max: '200' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Remove Date filter' })
    await canvas.findByRole('button', { name: 'Remove Budget filter' })
    await canvas.findByRole('button', { name: 'Clear all' })
  },
}

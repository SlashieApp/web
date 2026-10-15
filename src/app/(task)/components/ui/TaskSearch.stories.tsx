import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { withTaskBrowseStory } from '../../helpers/taskBrowseStoryDecorator'
import { TaskSearch, TaskSearchBase } from './TaskSearch'

const copy = {
  placeholder: 'Search a task',
  clearSearch: 'Clear search',
  useCurrentLocation: 'Use current location',
}

const meta = {
  title: 'Tasks/TaskSearch',
  component: TaskSearchBase,
  parameters: { layout: 'padded' },
  args: {
    mode: 'input',
    value: '',
    onValueChange: fn(),
    onCommit: fn(),
    onClear: fn(),
    onOpen: fn(),
    onUseCurrentLocation: fn(),
    copy,
  },
  decorators: [
    (Story) => (
      <Box maxW="460px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskSearchBase>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop panel / mobile sheet: typing searches; Enter applies at once. */
export const Input: Story = {
  render: function TaskSearchInputStory(args) {
    const [value, setValue] = useState('garden')
    const [commits, setCommits] = useState(0)
    return (
      <Stack gap={3}>
        <TaskSearchBase
          {...args}
          value={value}
          onValueChange={setValue}
          onCommit={() => setCommits((n) => n + 1)}
          onClear={() => setValue('')}
        />
        <Box fontSize="sm" color="text.muted">
          Enter presses: {commits}
        </Box>
      </Stack>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(await canvas.findByRole('searchbox'), '{Enter}')
    await canvas.findByText('Enter presses: 1')
    // Clear empties the field, and the clear button goes with it.
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }))
    expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull()
  },
}

/** Empty field: the placeholder only, no clear button. */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByPlaceholderText('Search a task')
    expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull()
  },
}

/** Results loading: an inline spinner beside the buttons. */
export const Pending: Story = {
  args: { value: 'garden', pending: true },
}

/** Collapsed mobile bar, empty: read-only; a tap opens the search sheet. */
export const Trigger: Story = {
  args: { mode: 'trigger' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByRole('textbox'))
    await expect(args.onOpen).toHaveBeenCalledOnce()
  },
}

/** Collapsed mobile bar with a search applied: shows the text, no clear button. */
export const TriggerWithSearch: Story = {
  args: { mode: 'trigger', value: 'garden' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(await canvas.findByDisplayValue('garden')).toHaveAttribute(
      'readonly',
    )
    expect(canvas.queryByRole('button', { name: 'Clear search' })).toBeNull()
  },
}

/** Connected to the browse state: the field starts with the shared search. */
export const ConnectedInput: Story = {
  render: () => <TaskSearch mode="input" />,
  decorators: [
    withTaskBrowseStory({ initialState: { searchText: 'chandelier' } }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(await canvas.findByDisplayValue('chandelier')).toBeVisible()
  },
}

/** Connected collapsed bar: shows the applied search; a tap opens the sheet. */
export const ConnectedTrigger: Story = {
  render: () => <TaskSearch mode="trigger" />,
  decorators: [
    withTaskBrowseStory({
      isDesktop: false,
      initialState: { searchText: 'chandelier' },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(await canvas.findByDisplayValue('chandelier')).toHaveAttribute(
      'readonly',
    )
  },
}

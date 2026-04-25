import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseAreaLocationInputBase } from './TaskBrowseAreaLocationInput'

const meta: Meta = {
  title: 'ui/Input',
  component: TaskBrowseAreaLocationInputBase,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta

type Story = StoryObj

export const LocationInput: Story = {
  render: () => (
    <TaskBrowseAreaLocationInputBase
      value=""
      onValueChange={() => {}}
      onCommit={() => {}}
    />
  ),
} satisfies Meta<typeof TaskBrowseAreaLocationInputBase>

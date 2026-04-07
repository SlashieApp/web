import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TaskBrowseMobileFiltersBar } from './TaskBrowseMobileFiltersBar'

const meta = {
  title: 'ui/TaskBrowseMobileFiltersBar',
  component: TaskBrowseMobileFiltersBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onOpenFilters: () => {},
  },
} satisfies Meta<typeof TaskBrowseMobileFiltersBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

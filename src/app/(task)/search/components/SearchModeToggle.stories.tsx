import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import type { SearchMode } from '../helpers/searchQueryParams'
import {
  SearchModeToggleBase,
  type SearchModeToggleBaseProps,
} from './SearchModeToggle'

const meta = {
  title: 'search/SearchModeToggle',
  component: SearchModeToggleBase,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<SearchModeToggleBaseProps>

export default meta

type Story = StoryObj<typeof meta>

function InteractiveToggle({ initial }: { initial: SearchMode }) {
  const [mode, setMode] = useState<SearchMode>(initial)
  return <SearchModeToggleBase mode={mode} onModeChange={setMode} />
}

export const TasksMode: Story = {
  args: { mode: 'tasks', onModeChange: () => {} },
  render: () => <InteractiveToggle initial="tasks" />,
}

export const WorkersMode: Story = {
  args: { mode: 'workers', onModeChange: () => {} },
  render: () => <InteractiveToggle initial="workers" />,
}

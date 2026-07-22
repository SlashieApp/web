import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import type { SearchMode } from '../../helpers/searchQueryParams'
import {
  SearchModeSelectorBase,
  type SearchModeSelectorBaseProps,
} from './SearchModeSelector'

const meta = {
  title: 'task/search/SearchModeSelector',
  component: SearchModeSelectorBase,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<SearchModeSelectorBaseProps>

export default meta

type Story = StoryObj<typeof meta>

function InteractiveSelector({ initial }: { initial: SearchMode }) {
  const [mode, setMode] = useState<SearchMode>(initial)
  return <SearchModeSelectorBase mode={mode} onModeChange={setMode} />
}

export const TasksMode: Story = {
  args: { mode: 'tasks', onModeChange: () => {} },
  render: () => <InteractiveSelector initial="tasks" />,
}

export const WorkersMode: Story = {
  args: { mode: 'workers', onModeChange: () => {} },
  render: () => <InteractiveSelector initial="workers" />,
}

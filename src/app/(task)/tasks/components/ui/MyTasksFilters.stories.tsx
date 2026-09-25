import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import type { HubSectionFilter } from '../../helpers/myTasksHubFilters'
import { MyTasksFilterEmpty, MyTasksFilters } from './MyTasksFilters'

const owners = [
  { ownerUserId: 'me', label: 'You' },
  { ownerUserId: 'alex', label: 'Alex' },
]
const categories = [
  { category: 'CLEANING', label: 'Cleaning' },
  { category: 'HANDYMAN', label: 'Handyman' },
]

function FiltersDemo({
  defaultExpanded = false,
}: {
  defaultExpanded?: boolean
}) {
  const [search, setSearch] = useState('')
  const [ownerUserId, setOwnerUserId] = useState('')
  const [category, setCategory] = useState('')
  const [hubSection, setHubSection] = useState<HubSectionFilter | ''>('')
  const active = Boolean(search || ownerUserId || category || hubSection)
  return (
    <MyTasksFilters
      search={search}
      onSearchChange={setSearch}
      ownerUserId={ownerUserId}
      onOwnerChange={setOwnerUserId}
      owners={owners}
      category={category}
      onCategoryChange={setCategory}
      categories={categories}
      hubSection={hubSection}
      onHubSectionChange={setHubSection}
      active={active}
      defaultExpanded={defaultExpanded}
      onClear={() => {
        setSearch('')
        setOwnerUserId('')
        setCategory('')
        setHubSection('')
      }}
    />
  )
}

const meta = {
  title: 'task/tasks/ui/MyTasksFilters',
  component: MyTasksFilters,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    search: '',
    onSearchChange: () => undefined,
    ownerUserId: '',
    onOwnerChange: () => undefined,
    owners,
    category: '',
    onCategoryChange: () => undefined,
    categories,
    hubSection: '',
    onHubSectionChange: () => undefined,
    active: false,
    onClear: () => undefined,
  },
} satisfies Meta<typeof MyTasksFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <FiltersDemo />,
}

export const Expanded: Story = {
  render: () => <FiltersDemo defaultExpanded />,
}

export const NoMatch: Story = {
  render: () => <MyTasksFilterEmpty onClear={() => undefined} />,
}

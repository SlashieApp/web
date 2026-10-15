import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

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

type DemoProps = {
  initialSearch?: string
  initialOwner?: string
  initialCategory?: string
  initialSection?: HubSectionFilter | ''
  defaultExpanded?: boolean
}

/** The filters with their own state, as the hub page wires them. */
function FiltersDemo({
  initialSearch = '',
  initialOwner = '',
  initialCategory = '',
  initialSection = '',
  defaultExpanded = false,
}: DemoProps) {
  const [search, setSearch] = useState(initialSearch)
  const [ownerUserId, setOwnerUserId] = useState(initialOwner)
  const [category, setCategory] = useState(initialCategory)
  const [hubSection, setHubSection] = useState<HubSectionFilter | ''>(
    initialSection,
  )
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
  title: 'My tasks/MyTasksFilters',
  component: MyTasksFilters,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    search: '',
    onSearchChange: fn(),
    ownerUserId: '',
    onOwnerChange: fn(),
    owners,
    category: '',
    onCategoryChange: fn(),
    categories,
    hubSection: '',
    onHubSectionChange: fn(),
    active: false,
    onClear: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyTasksFilters>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing applied: the search field and the section buttons, All pressed. */
export const Default: Story = {
  render: () => <FiltersDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('searchbox', { name: 'Search tasks' })
    expect(canvas.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(canvas.queryByRole('button', { name: 'Clear filters' })).toBeNull()
  },
}

/** The Filters toggle is open: task owner and category selects. */
export const Expanded: Story = {
  render: () => <FiltersDemo defaultExpanded />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByLabelText('Task owner')
    await canvas.findByLabelText('Category')
  },
}

/** Opened with the toggle: pressing Filters shows and hides the selects. */
export const TogglesOpen: Story = {
  render: () => <FiltersDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Filters' }),
    )
    await canvas.findByLabelText('Task owner')
    await userEvent.click(canvas.getByRole('button', { name: 'Filters' }))
    expect(canvas.queryByLabelText('Task owner')).toBeNull()
  },
}

/** A search typed: Clear filters appears, and clearing resets the field. */
export const Searching: Story = {
  render: () => <FiltersDemo initialSearch="tap" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Clear filters' }),
    )
    expect(canvas.getByRole('searchbox')).toHaveValue('')
  },
}

/** A section chosen (Booked): that button is pressed, Clear filters shows. */
export const SectionSelected: Story = {
  render: () => <FiltersDemo initialSection="BOOKED" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(
      await canvas.findByRole('button', { name: 'Booked / In progress' }),
    ).toHaveAttribute('aria-pressed', 'true')
    await canvas.findByRole('button', { name: 'Clear filters' })
  },
}

/** Owner and category chosen: the Filters toggle is highlighted. */
export const AdvancedFiltersApplied: Story = {
  render: () => (
    <FiltersDemo
      defaultExpanded
      initialOwner="alex"
      initialCategory="CLEANING"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(await canvas.findByLabelText('Task owner')).toHaveValue('alex')
    expect(canvas.getByLabelText('Category')).toHaveValue('CLEANING')
    expect(canvas.getByRole('button', { name: 'Filters' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  },
}

/** Nothing matches the filters: the message and a Clear filters button. */
export const NoMatch: Story = {
  render: () => <MyTasksFilterEmpty onClear={() => undefined} />,
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('No matching tasks')
  },
}

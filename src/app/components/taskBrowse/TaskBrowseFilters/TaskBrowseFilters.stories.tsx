import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { TaskBrowseFilters, type UrgencyFilter } from './TaskBrowseFilters'

const CATEGORIES = ['Plumbing', 'Electrical', 'Carpentry', 'HVAC'] as const

const noopSet = new Set<string>()

const meta = {
  title: 'app/components/taskBrowse/TaskBrowseFilters',
  component: TaskBrowseFilters,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    categories: CATEGORIES,
    selectedCategories: noopSet,
    onToggleCategory: () => {},
    searchQuery: '',
    onSearchChange: () => {},
    radiusMiles: 15,
    onRadiusChange: () => {},
    minBudgetPounds: '',
    maxBudgetPounds: '',
    onMinBudgetChange: () => {},
    onMaxBudgetChange: () => {},
    urgency: 'any' as UrgencyFilter,
    onUrgencyChange: () => {},
    mapHref: '/',
  },
} satisfies Meta<typeof TaskBrowseFilters>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState(() => new Set<string>(CATEGORIES))
    const [radius, setRadius] = useState(15)
    const [minB, setMinB] = useState('')
    const [maxB, setMaxB] = useState('')
    const [urgency, setUrgency] = useState<UrgencyFilter>('any')

    return (
      <TaskBrowseFilters
        categories={CATEGORIES}
        selectedCategories={selected}
        onToggleCategory={(cat, checked) => {
          setSelected((prev) => {
            const next = new Set(prev)
            if (checked) next.add(cat)
            else next.delete(cat)
            return next
          })
        }}
        searchQuery=""
        onSearchChange={() => {}}
        radiusMiles={radius}
        onRadiusChange={setRadius}
        minBudgetPounds={minB}
        maxBudgetPounds={maxB}
        onMinBudgetChange={setMinB}
        onMaxBudgetChange={setMaxB}
        urgency={urgency}
        onUrgencyChange={setUrgency}
        mapHref="/"
      />
    )
  },
}

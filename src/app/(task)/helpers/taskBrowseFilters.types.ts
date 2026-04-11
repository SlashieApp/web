import type { TaskCategory } from '@codegen/schema'

export type UrgencyFilter = 'any' | 'emergency' | 'today' | 'week'

export type TaskBrowseFiltersProps = {
  categories: readonly TaskCategory[]
  selectedCategories: Set<TaskCategory>
  onToggleCategory: (category: TaskCategory, checked: boolean) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  areaLocationInput?: string
  onAreaLocationChange?: (value: string) => void
  onAreaLocationCommit?: () => void
  radiusMiles: number
  onRadiusChange: (miles: number) => void
  minBudgetPounds: string
  maxBudgetPounds: string
  onMinBudgetChange: (value: string) => void
  onMaxBudgetChange: (value: string) => void
  urgency: UrgencyFilter
  onUrgencyChange: (value: UrgencyFilter) => void
  sortValue?: string
  sortOptions?: readonly { value: string; label: string }[]
  onSortChange?: (value: string) => void
  showMapPromo?: boolean
  variant?: 'default' | 'compact'
}

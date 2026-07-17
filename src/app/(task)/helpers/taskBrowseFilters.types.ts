export type UrgencyFilter = 'any' | 'emergency' | 'today' | 'week'

export type TaskBrowseFiltersProps = {
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
  /** Selected API category code (`''` = all categories). */
  category?: string
  onCategoryChange?: (value: string) => void
  /** Inclusive scheduled-date bounds (`YYYY-MM-DD`); sent as `scheduledAfter` / `scheduledBefore`. */
  scheduledAfter?: string
  onScheduledAfterChange?: (value: string) => void
  scheduledBefore?: string
  onScheduledBeforeChange?: (value: string) => void
  sortValue?: string
  sortOptions?: readonly { value: string; label: string }[]
  onSortChange?: (value: string) => void
}

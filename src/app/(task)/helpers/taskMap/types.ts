import type { SearchThisAreaButtonProps } from '../../components/SearchThisAreaButton'

export type TaskMapTask = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  location?: string | null
  locationLat?: number | null
  locationLng?: number | null
  /** Shown on the map pin (e.g. £65 — or the worker's first name for person pins). */
  priceLabel?: string | null
  /** Short line for popup (e.g. budget). */
  detailLine?: string | null
  /** Distance from the active browse reference (e.g. "2.1 miles away"). */
  distanceLabel?: string | null
  /**
   * Pin appearance. `price` (default) renders the classic price pill;
   * `person` renders an avatar chip + label for worker search results.
   */
  pinKind?: 'price' | 'person'
  /** Avatar for `person` pins; initials fall back from `title`. */
  avatarUrl?: string | null
}

export type TaskMapPropsSnapshot = {
  accessToken: string | undefined
  centerLat: number
  centerLng: number
  radiusMiles: number
  tasks: TaskMapTask[]
  visible?: boolean
  tasksLoaded?: boolean
  leftViewportPadding?: number
  onSearchThisAreaConfirm?: (lat: number, lng: number, zoom: number) => void
  searchAreaButtonLeftInset?: string
  searchAreaButtonPosition?: 'top' | 'bottom'
  searchAreaButtonOffsetX?: string
  onMapClick?: () => void
  onReadyChange?: (ready: boolean) => void
  selectedTaskId?: string | null
  /** Bumps when the same task is selected again so the map can redraw the route. */
  selectedTaskSelectionToken?: number
  onSelectTask?: (taskId: string | null) => void
  onSearchThisAreaUiChange?: (ui: SearchThisAreaButtonProps) => void
  onNavRoutePresentingChange?: (presenting: boolean) => void
  /**
   * When false, selecting a pin does not draw the driving nav route (worker
   * pins sit at approximate service-area locations — a turn-by-turn route
   * would imply a precision we do not have). Defaults to true.
   */
  navRouteEnabled?: boolean
  effectiveSearchRadiusMiles: number
  themeMode: 'light' | 'dark'
}

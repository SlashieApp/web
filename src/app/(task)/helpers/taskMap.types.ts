import type { SearchThisAreaButtonProps } from '../components/SearchThisAreaButton'

export type TaskMapTask = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  location?: string | null
  locationLat?: number | null
  locationLng?: number | null
  /** Shown on the map pin (e.g. £65). */
  priceLabel?: string | null
  /** Short line for popup (e.g. budget). */
  detailLine?: string | null
  /** Distance from the active browse reference (e.g. "2.1 miles away"). */
  distanceLabel?: string | null
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
  onSelectTask?: (taskId: string | null) => void
  onSearchThisAreaUiChange?: (ui: SearchThisAreaButtonProps) => void
  effectiveSearchRadiusMiles: number
  themeMode: 'light' | 'dark'
}

import {
  SHEET_FLICK_VELOCITY,
  SHEET_PROJECT_SECONDS,
} from '@/ui/Drawer/sheetMotion'

/**
 * The location step's pull-up panel on phones and tablets (FE-349): compact
 * (the area, an Add exact address row and Continue) or expanded (the full
 * address form). Desktop always shows the full card.
 */
export type LocationPanelState = 'compact' | 'expanded'

/**
 * How the panel opens on each visit to the location step: compact on every
 * phone, so the map gets the room, unless the exact address still needs
 * fixing (a Post sent the poster back to it).
 */
export function initialLocationPanel(
  addressError: string | undefined,
): LocationPanelState {
  return addressError ? 'expanded' : 'compact'
}

/**
 * Where a released drag settles. A flick goes the way it was thrown;
 * otherwise the panel snaps to the nearer state, after projecting the release
 * velocity a little way on (the `@ui` Drawer's tuning). Heights are the
 * panel body's in px; `velocity` is px/s, positive while the panel grows.
 */
export function resolveLocationPanelSnap({
  height,
  compact,
  expanded,
  velocity,
}: {
  height: number
  compact: number
  expanded: number
  velocity: number
}): LocationPanelState {
  if (velocity >= SHEET_FLICK_VELOCITY) return 'expanded'
  if (velocity <= -SHEET_FLICK_VELOCITY) return 'compact'
  const projected = height + velocity * SHEET_PROJECT_SECONDS
  const top = Math.max(expanded, compact)
  return projected - compact > top - projected ? 'expanded' : 'compact'
}

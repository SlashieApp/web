import { brandPrimary } from '@/theme/brand'

import type { TaskMapApproxZone } from './types'
import type { ZoneCircleLayerIds, ZoneCirclePaint } from './zoneCircle'

/** Style layer ids of the task-detail approximate circle (FE-472). */
export const APPROX_ZONE_LAYERS: ZoneCircleLayerIds = {
  source: 'task-detail-approx-zone',
  fill: 'task-detail-approx-zone-fill',
  line: 'task-detail-approx-zone-line',
}

/**
 * The circle's paint: a soft fill in green 400 and an outline in green 600,
 * so the edge reads on the map under the title's wash. The same values in
 * the app (FE-473).
 */
export const APPROX_ZONE_PAINT: ZoneCirclePaint = {
  fillColor: brandPrimary[400],
  fillOpacity: 0.18,
  lineColor: brandPrimary[600],
  lineOpacity: 0.9,
  lineWidth: 2.5,
}

/** Changes when the circle must be redrawn. */
export function approxZoneKey(zone: TaskMapApproxZone | null | undefined) {
  return zone ? `${zone.taskId}|${zone.lat}|${zone.lng}|${zone.radiusM}` : ''
}

/** Changes when the camera must frame the circle again. */
export function approxZoneCameraKey(
  zone: TaskMapApproxZone | null | undefined,
  viewPaddingSig: string,
) {
  return zone ? `${approxZoneKey(zone)}|${zone.zoom}|${viewPaddingSig}` : ''
}

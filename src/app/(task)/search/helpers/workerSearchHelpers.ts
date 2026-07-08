import type { WorkersSearchQuery } from '@codegen/schema'

import type { TaskMapTask } from '../../helpers/taskMap'

export type WorkerSearchItem = WorkersSearchQuery['workers'][number]

export function workerDisplayName(worker: WorkerSearchItem): string {
  return worker.user?.profile?.name?.trim() || 'Worker'
}

export function workerFirstName(worker: WorkerSearchItem): string {
  return workerDisplayName(worker).split(/\s+/)[0] ?? 'Worker'
}

export function workerAvatarUrl(worker: WorkerSearchItem): string | null {
  return (
    worker.user?.profile?.avatarUrl?.trim() ||
    worker.profile?.avatarUrl?.trim() ||
    null
  )
}

/** Approximate service-area label (BE-34 `serviceAreaLabel`) — never an address. */
export function workerServiceAreaLabel(
  worker: WorkerSearchItem,
): string | null {
  const label = worker.serviceAreaLabel?.trim()
  if (label) return label
  // Fallback for workers created before BE-34 backfill.
  const area = worker.preferredLocation?.name?.trim()
  if (!area) return null
  const radius = worker.serviceArea?.radiusMiles
  return radius != null && radius > 0
    ? `${area} (~${Math.round(radius)} miles)`
    : area
}

export function workerSubtitle(worker: WorkerSearchItem): string {
  const tagline = worker.tagline?.trim()
  if (tagline) return tagline
  const parts: string[] = []
  if (worker.yearsExperience != null && worker.yearsExperience > 0) {
    parts.push(
      `${worker.yearsExperience} yr${worker.yearsExperience === 1 ? '' : 's'} experience`,
    )
  }
  const area = worker.preferredLocation?.name?.trim()
  if (area) parts.push(area)
  return parts.length > 0 ? parts.join(' · ') : 'Local worker on Slashie'
}

export function workerHasServiceAreaCoords(worker: WorkerSearchItem): boolean {
  const lat = worker.preferredLocation?.lat
  const lng = worker.preferredLocation?.lng
  return (
    lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
  )
}

/**
 * Map point at the worker's approximate preferred location (BE-34: public
 * lat/lng/name; the address field only resolves for the worker themself).
 * Workers without coordinates are excluded from the map but stay in the list
 * with an "area not set" note.
 */
export function workerToMapPoint(worker: WorkerSearchItem): TaskMapTask | null {
  if (!workerHasServiceAreaCoords(worker)) return null
  const areaLabel = workerServiceAreaLabel(worker)
  return {
    id: worker.id,
    title: workerDisplayName(worker),
    description: worker.tagline ?? null,
    location: worker.preferredLocation?.name ?? null,
    locationLat: worker.preferredLocation?.lat,
    locationLng: worker.preferredLocation?.lng,
    // Pill text: the worker's first name (person pins render an avatar chip).
    priceLabel: workerFirstName(worker),
    detailLine: workerDisplayName(worker),
    distanceLabel: areaLabel
      ? `Serves ${areaLabel}`
      : 'Service area on profile',
    pinKind: 'person',
    avatarUrl: workerAvatarUrl(worker),
  }
}

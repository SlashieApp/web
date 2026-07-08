import type { WorkerPublicProfileQuery } from '@codegen/schema'

export type WorkerPublicRecord = NonNullable<WorkerPublicProfileQuery['worker']>

export function workerPublicDisplayName(worker: WorkerPublicRecord): string {
  const profileName = worker.profile?.name?.trim()
  if (profileName) return profileName
  const legal = worker.legalName?.trim()
  if (legal) return legal
  return 'Worker'
}

export function workerPublicAvatarLabel(worker: WorkerPublicRecord): string {
  const name = workerPublicDisplayName(worker)
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'W'
  )
}

export function workerServiceAreaLabel(
  worker: WorkerPublicRecord,
): string | null {
  return (
    worker.serviceAreaLabel?.trim() ||
    worker.preferredLocation?.name?.trim() ||
    null
  )
}

/**
 * Hero service-area line, "Camden & Islington (~5 miles)" style. BE-34
 * computes `serviceAreaLabel`; the manual compose is a fallback for workers
 * created before the backfill. Never an exact address.
 */
export function workerServiceAreaDisplay(
  worker: WorkerPublicRecord,
): string | null {
  const computed = worker.serviceAreaLabel?.trim()
  if (computed) return computed
  const area = worker.preferredLocation?.name?.trim()
  if (!area) return null
  const radius = worker.serviceArea?.radiusMiles
  return radius != null && radius > 0
    ? `${area} (~${Math.round(radius)} miles)`
    : area
}

/** Hero headline: `Handyman • Furniture assembly • 3 years experience`. */
export function workerHeadline(worker: WorkerPublicRecord): string | null {
  const parts = worker.skills
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 2)
  const years = worker.yearsExperience
  if (years != null && years > 0) {
    parts.push(`${years} year${years === 1 ? '' : 's'} experience`)
  }
  return parts.length > 0 ? parts.join(' • ') : null
}

export function workerFirstName(worker: WorkerPublicRecord): string {
  return workerPublicDisplayName(worker).split(/\s+/)[0] ?? 'Worker'
}

/** Hero stats row: reviews · jobs completed · member since. */
export function workerHeroStats(worker: WorkerPublicRecord): string[] {
  const stats: string[] = []
  const { average, count } = worker.ratingSummary
  stats.push(
    count > 0 && average != null
      ? `${average.toFixed(1)} (${count} review${count === 1 ? '' : 's'})`
      : 'No reviews yet',
  )
  const jobs = worker.completedJobs.length || (worker.tasksCompletedCount ?? 0)
  stats.push(`${jobs} job${jobs === 1 ? '' : 's'} completed`)
  const memberSince = formatMemberSince(
    worker.memberSince ?? worker.user.createdAt,
  )
  if (memberSince) stats.push(`Member since ${memberSince}`)
  return stats
}

/** "March 2026"-style display for a completed job. */
export function formatCompletedMonth(completedAt: unknown): string {
  const date = new Date(String(completedAt))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function workerProfilePath(
  workerId: string,
  fromTask?: string | null,
): string {
  const base = `/workers/${workerId}`
  if (!fromTask?.trim()) return base
  return `${base}?fromTask=${encodeURIComponent(fromTask.trim())}`
}

export function formatMemberSince(createdAt: unknown): string | null {
  if (!createdAt) return null
  const date = new Date(String(createdAt))
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

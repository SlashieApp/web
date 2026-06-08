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
  const name = worker.location?.name?.trim()
  return name || null
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

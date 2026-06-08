import type { SearchProfessionalsQuery } from '@codegen/schema'

export type WorkerBrowseItem =
  SearchProfessionalsQuery['searchProfessionals'][number]

export function workerBrowseDisplayName(worker: WorkerBrowseItem): string {
  const profileName = worker.user?.profile?.name?.trim()
  if (profileName) return profileName
  return 'Worker'
}

export function workerBrowseAvatarUrl(worker: WorkerBrowseItem): string | null {
  const userAvatar = worker.user?.profile?.avatarUrl?.trim()
  if (userAvatar) return userAvatar
  const workerAvatar = worker.profile?.avatarUrl?.trim()
  return workerAvatar || null
}

export function workerBrowseAvatarLabel(worker: WorkerBrowseItem): string {
  const name = workerBrowseDisplayName(worker)
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'W'
  )
}

export function workerBrowseSubtitle(worker: WorkerBrowseItem): string {
  const tagline = worker.tagline?.trim()
  if (tagline) return tagline

  const parts: string[] = []
  if (worker.yearsExperience != null && worker.yearsExperience > 0) {
    parts.push(
      `${worker.yearsExperience} yr${worker.yearsExperience === 1 ? '' : 's'} experience`,
    )
  }
  const area = worker.location?.name?.trim()
  if (area) parts.push(area)

  return parts.length > 0 ? parts.join(' · ') : 'Local worker on Slashie'
}

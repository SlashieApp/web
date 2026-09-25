export type PublicProfilePathOptions = {
  excludeTaskId?: string | null
  fromTask?: string | null
}

/** Canonical public presence. `userId` is `users._id` (same as `me.id`). */
export function publicProfilePath(
  userId: string,
  options?: PublicProfilePathOptions,
): string {
  const base = `/profile/${userId}`
  const params: string[] = []
  const exclude = options?.excludeTaskId?.trim()
  const fromTask = options?.fromTask?.trim()
  if (exclude) params.push(`excludeTaskId=${encodeURIComponent(exclude)}`)
  if (fromTask) params.push(`fromTask=${encodeURIComponent(fromTask)}`)
  return params.length > 0 ? `${base}?${params.join('&')}` : base
}

/** Owner achievements anchor on the public profile. */
export function publicProfileAchievementsPath(userId: string): string {
  return `${publicProfilePath(userId)}#achievements`
}

/** Object-storage / CDN avatar hosts. */
export function isS3OrCdnAvatarUrl(url: string): boolean {
  return /cdn\.slashie\.app|amazonaws\.com|\.s3[.-]|s3\.amazonaws/i.test(url)
}

/** Google OAuth profile photo hosts. */
export function isGooglePhotoUrl(url: string): boolean {
  return /googleusercontent\.com/i.test(url)
}

/**
 * Ordered avatar URL candidates for load fallbacks.
 * Prefer CDN/S3 profile photo, then a secondary (e.g. Google) photo, then any
 * other primary URL. Empty list → caller shows initials/icon fallback.
 */
export function buildAvatarSrcCandidates(
  primaryUrl?: string | null,
  secondaryUrl?: string | null,
): string[] {
  const primary = primaryUrl?.trim() || ''
  const secondary = secondaryUrl?.trim() || ''
  const out: string[] = []

  if (primary && isS3OrCdnAvatarUrl(primary)) {
    out.push(primary)
  }
  if (secondary) {
    out.push(secondary)
  } else if (primary && isGooglePhotoUrl(primary)) {
    out.push(primary)
  }
  if (primary && !out.includes(primary)) {
    out.push(primary)
  }

  return out
}

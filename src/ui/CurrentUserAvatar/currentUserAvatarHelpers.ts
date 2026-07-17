/** Hosts that count as Slashie-uploaded / object-storage avatars. */
export function isS3OrCdnAvatarUrl(url: string): boolean {
  return /cdn\.slashie\.app|amazonaws\.com|\.s3[.-]|s3\.amazonaws/i.test(url)
}

/** Google OAuth profile photo hosts. */
export function isGooglePhotoUrl(url: string): boolean {
  return /googleusercontent\.com/i.test(url)
}

/**
 * Prefer S3/CDN profile avatar, then Google photo, then (as last URL) any other
 * profile avatar URL. Empty list → caller shows the blank user icon.
 */
export function buildCurrentUserAvatarCandidates(
  profileAvatarUrl?: string | null,
  googlePhotoUrl?: string | null,
): string[] {
  const profile = profileAvatarUrl?.trim() || ''
  const google = googlePhotoUrl?.trim() || ''
  const out: string[] = []

  if (profile && isS3OrCdnAvatarUrl(profile)) {
    out.push(profile)
  }
  if (google) {
    out.push(google)
  } else if (profile && isGooglePhotoUrl(profile)) {
    out.push(profile)
  }
  // Unknown host (or non-S3/non-Google) still worth trying before the icon.
  if (profile && !out.includes(profile)) {
    out.push(profile)
  }

  return out
}

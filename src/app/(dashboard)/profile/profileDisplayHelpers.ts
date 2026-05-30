import { getDisplayNameFromEmail } from '@/utils/dashboardHelpers'

export function displayNameFromMe(me: {
  profile?: { name?: string | null } | null
  email: string
}) {
  const profileName = me.profile?.name?.trim()
  if (profileName) return profileName
  return getDisplayNameFromEmail(me.email)
}

export function joinMonthYear(iso: unknown) {
  const d =
    typeof iso === 'string' || typeof iso === 'number'
      ? new Date(iso)
      : iso instanceof Date
        ? iso
        : null
  if (!d || Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/** `profile.name` for editing; empty string if unset so the user can set a display name. */
export function initialDisplayNameForForm(me: {
  profile?: { name?: string | null } | null
}): string {
  const n = me.profile?.name?.trim()
  return n ?? ''
}

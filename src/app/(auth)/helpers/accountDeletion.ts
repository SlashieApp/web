import type { AppLocale } from '@/i18n/locales'

/** "12 November 2026" / "2026年11月12日" for a deletion date. */
export function formatDeletionDate(iso: string, locale: AppLocale): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * After requesting deletion the user is signed out to `/login?deletion=DATE`
 * (just the day, no personal data). The deletion emails link to
 * `/login?restore=1`.
 */
export function loginPathAfterDeletion(scheduledFor: string): string {
  const day = scheduledFor.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day)
    ? `/login?deletion=${day}`
    : '/login?deletion=1'
}

export type DeletionNotice =
  | { kind: 'scheduled'; date: string | null }
  | { kind: 'restore' }

/** What the login page says about a deletion, from its query string. */
export function deletionNoticeFromParams(
  params: Pick<URLSearchParams, 'get'>,
): DeletionNotice | null {
  const deletion = params.get('deletion')
  if (deletion) {
    return {
      kind: 'scheduled',
      date: /^\d{4}-\d{2}-\d{2}$/.test(deletion) ? deletion : null,
    }
  }
  if (params.get('restore') === '1') return { kind: 'restore' }
  return null
}

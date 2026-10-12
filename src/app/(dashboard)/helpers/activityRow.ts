export type ActivityTone = 'green' | 'purple' | 'blue' | 'mint' | 'red'

/** One row in an inbox activity panel (dashboard, quotes, requests). */
export type ActivityRow = {
  id: string
  title: string
  subtitle: string
  happenedAt: unknown
  tone: ActivityTone
  href: string
}

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'

export type ReportTargetKind = 'task' | 'worker'

export type ReportMailtoInput = {
  kind: ReportTargetKind
  id: string
  title?: string
  url?: string
  reason?: string
  details?: string
}

const KIND_LABEL: Record<ReportTargetKind, string> = {
  task: 'task',
  worker: 'worker',
}

/**
 * Build a `mailto:admin@slashie.app` URL with a prefilled subject and body
 * (entity id + page URL). Closed-beta trust minimum — no moderation queue.
 */
export function buildReportMailto(input: ReportMailtoInput): string {
  const kindLabel = KIND_LABEL[input.kind]
  const subject = `Report ${kindLabel} ${input.id}`.trim()
  const lines = [
    `I would like to report a ${kindLabel} on Slashie.`,
    '',
    `${kindLabel === 'worker' ? 'Worker' : 'Task'} ID: ${input.id}`,
  ]
  const title = input.title?.trim()
  if (title) lines.push(`Title: ${title}`)
  const url = input.url?.trim()
  if (url) lines.push(`URL: ${url}`)
  const reason = input.reason?.trim()
  if (reason) lines.push(`Reason: ${reason}`)
  const details = input.details?.trim()
  if (details) {
    lines.push('', 'Details:', details)
  }
  lines.push('', '— Sent from Slashie')

  const params = new URLSearchParams({
    subject,
    body: lines.join('\n'),
  })
  return `mailto:${LEGAL_CONTACT_EMAIL}?${params.toString()}`
}

export function openReportMailto(href: string) {
  if (typeof window === 'undefined') return
  window.location.assign(href)
}

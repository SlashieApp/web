import { describe, expect, it } from 'vitest'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'

import { buildReportMailto } from './reportMailto'

describe('buildReportMailto', () => {
  it('prefills admin@slashie.app with task id and URL', () => {
    const href = buildReportMailto({
      kind: 'task',
      id: 'task-42',
      title: 'Garden tidy in Clapham',
      url: 'https://slashie.app/tasks/task-42',
      reason: 'Spam or scam',
      details: 'Asks for a deposit before visiting.',
    })

    expect(href.startsWith(`mailto:${LEGAL_CONTACT_EMAIL}?`)).toBe(true)

    const query = href.slice(`mailto:${LEGAL_CONTACT_EMAIL}?`.length)
    const params = new URLSearchParams(query)
    expect(params.get('subject')).toBe('Report task task-42')
    const body = params.get('body') ?? ''
    expect(body).toContain('Task ID: task-42')
    expect(body).toContain('Title: Garden tidy in Clapham')
    expect(body).toContain('URL: https://slashie.app/tasks/task-42')
    expect(body).toContain('Reason: Spam or scam')
    expect(body).toContain('Asks for a deposit before visiting.')
  })

  it('prefills worker reports without inventing a title', () => {
    const href = buildReportMailto({
      kind: 'worker',
      id: 'worker-9',
      url: 'https://slashie.app/workers/worker-9',
    })
    const query = href.slice(`mailto:${LEGAL_CONTACT_EMAIL}?`.length)
    const params = new URLSearchParams(query)
    expect(params.get('subject')).toBe('Report worker worker-9')
    const body = params.get('body') ?? ''
    expect(body).toContain('Worker ID: worker-9')
    expect(body).not.toContain('Title:')
    expect(body).not.toContain('Reason:')
  })
})

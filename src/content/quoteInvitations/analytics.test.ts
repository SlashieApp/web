import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { EVENTS, isCanonicalAnalyticsEvent } from '@/utils/analytics/events'

const dir = dirname(fileURLToPath(import.meta.url))
const read = (file: string) => readFileSync(join(dir, file), 'utf8')

describe('quote invitation analytics (FE-507)', () => {
  it('has the four events in the catalogue', () => {
    for (const name of [
      'quote_invite_sent',
      'quote_invite_failed',
      'quote_invite_dismissed',
      'quote_invite_prompt_skipped',
    ] as const) {
      expect(EVENTS[name]).toBe(name)
      expect(isCanonicalAnalyticsEvent(name)).toBe(true)
    }
  })

  it('sends quote_invite_sent with the task, the worker and where it was asked', () => {
    const src = read('useAskWorkerToQuote.ts')
    expect(src).toContain('EVENTS.quote_invite_sent')
    expect(src).toContain('task_id: input.taskId')
    expect(src).toContain('worker_id: input.workerUserId')
    expect(src).toContain('surface: input.surface')
  })

  it('sends quote_invite_failed with the API code only', () => {
    const src = read('useAskWorkerToQuote.ts')
    expect(src).toContain(
      "EVENTS.quote_invite_failed,\n          { code: code ?? 'UNKNOWN' }",
    )
  })

  it('sends quote_invite_dismissed with the task', () => {
    expect(read('useDismissQuoteInvitation.ts')).toContain(
      'EVENTS.quote_invite_dismissed,\n          { task_id: taskId }',
    )
  })

  it('sends quote_invite_prompt_skipped when Not now is chosen on the task page', () => {
    const src = readFileSync(
      join(
        dir,
        '../../app/(task)/tasks/[slug]/components/overview/TaskAskAfterPost.tsx',
      ),
      'utf8',
    )
    expect(src).toContain(
      'capture(EVENTS.quote_invite_prompt_skipped, { task_id: task.id })',
    )
    expect(src).toContain("surface: 'after_post'")
  })

  it('names the surface as profile or after_post, and only a tap sends', () => {
    const types = read('types.ts')
    expect(types).toContain("'profile' | 'after_post'")
  })
})

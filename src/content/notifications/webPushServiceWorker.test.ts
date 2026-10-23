import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('web push service worker', () => {
  const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8')

  it('opens the review page for REVIEW_PROMPT clicks', () => {
    expect(source).toContain('REVIEW_PROMPT')
    expect(source).toContain('/review')
    expect(source).toContain('notificationclick')
  })

  it('opens the task for a task cancelled or reopened, else the conversation', () => {
    const start = source.indexOf('const TASK_FLASHES')
    const end = source.indexOf('\n}\n', source.indexOf('function pushPath'))
    const pushPath = new Function(
      `${source.slice(start, end + 2)}\nreturn pushPath`,
    )() as (input: Record<string, string>) => string
    expect(
      pushPath({ flashKind: 'TASK_CANCELLED', taskId: 't 1', threadId: 'th' }),
    ).toBe('/tasks/t%201')
    expect(
      pushPath({ flashKind: 'TASK_REOPENED', taskId: 't1', threadId: 'th' }),
    ).toBe('/tasks/t1')
    expect(
      pushPath({ flashKind: 'QUOTE_ACCEPTED', taskId: 't1', threadId: 'th' }),
    ).toBe('/messages/th')
  })
})

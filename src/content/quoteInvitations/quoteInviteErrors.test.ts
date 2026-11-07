import { describe, expect, it } from 'vitest'

import { quoteInviteErrorKey } from './quoteInviteErrors'

describe('quoteInviteErrorKey', () => {
  it('maps each invitation code', () => {
    expect(quoteInviteErrorKey('QUOTE_INVITE_ALREADY_SENT')).toBe('alreadySent')
    expect(quoteInviteErrorKey('QUOTE_INVITE_TASK_LIMIT')).toBe('taskLimit')
    expect(quoteInviteErrorKey('QUOTE_INVITE_DAILY_LIMIT')).toBe('dailyLimit')
    expect(quoteInviteErrorKey('QUOTE_INVITE_NOT_AVAILABLE')).toBe(
      'notAvailable',
    )
  })

  it('reads a task that is closed, suspended or gone as one line', () => {
    for (const code of ['TASK_NOT_OPEN', 'TASK_SUSPENDED', 'TASK_NOT_FOUND']) {
      expect(quoteInviteErrorKey(code)).toBe('taskClosed')
    }
  })

  it('leaves every other code to the generic error', () => {
    expect(quoteInviteErrorKey('FORBIDDEN')).toBeNull()
    expect(quoteInviteErrorKey('EMAIL_NOT_VERIFIED')).toBeNull()
    expect(quoteInviteErrorKey(undefined)).toBeNull()
  })
})

describe('generic error copy', () => {
  it('is the task page action-failed line in both languages', async () => {
    const task = (await import('@/app/(task)/tasks/[slug]/i11n.json')).default
    const mine = (await import('./i11n.json')).default
    expect(mine.en.errors.generic).toBe(task.en.close.actionFailed)
    expect(mine.zh_hk.errors.generic).toBe(task.zh_hk.close.actionFailed)
  })
})

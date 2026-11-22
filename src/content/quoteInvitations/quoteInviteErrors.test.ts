import { describe, expect, it } from 'vitest'

import bag from './i11n.json'
import { quoteInviteErrorKey, quoteInviteErrorText } from './quoteInviteErrors'

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

describe('quoteInviteErrorText (FE-603: the limits follow Slashie Pro)', () => {
  const errors = bag.en.errors

  it('at the task limit without Pro: one per task, and what Pro gives', () => {
    expect(
      quoteInviteErrorText('taskLimit', errors, { name: 'Ada', hasPro: false }),
    ).toBe(
      'You can ask one worker per task. With Slashie Pro you can ask up to 30.',
    )
  })

  it('at the task limit with Pro: 30 is the most', () => {
    expect(
      quoteInviteErrorText('taskLimit', errors, { name: 'Ada', hasPro: true }),
    ).toBe("You've asked 30 workers about this task, the most for one task.")
  })

  it("the day's limit is 10 without Pro and 60 with it", () => {
    expect(
      quoteInviteErrorText('dailyLimit', errors, {
        name: 'Ada',
        hasPro: false,
      }),
    ).toBe("You've asked 10 workers in the last 24 hours. Try again later.")
    expect(
      quoteInviteErrorText('dailyLimit', errors, { name: 'Ada', hasPro: true }),
    ).toBe("You've asked 60 workers in the last 24 hours. Try again later.")
  })

  it('the other lines name the worker as before', () => {
    expect(
      quoteInviteErrorText('alreadySent', errors, {
        name: 'Ada',
        hasPro: false,
      }),
    ).toBe("You've already asked Ada about this task.")
  })

  it('reads the same in Chinese', () => {
    expect(
      quoteInviteErrorText('taskLimit', bag.zh_hk.errors, {
        name: 'Ada',
        hasPro: false,
      }),
    ).toBe('每項任務可邀請一位工作者。使用 Slashie Pro 最多可邀請 30 位。')
  })
})

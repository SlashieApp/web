import { describe, expect, it } from 'vitest'

import { EVENTS, isCanonicalAnalyticsEvent } from '@/utils/analytics/events'

import {
  inviteDismissedProps,
  inviteFailedProps,
  invitePromptSkippedProps,
  inviteSentProps,
} from './quoteInviteEvents'

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

  it('quote_invite_sent carries the task, the worker and where it was asked, and nothing else', () => {
    expect(
      inviteSentProps({
        taskId: 't1',
        workerUserId: 'w1',
        surface: 'after_post',
        // Extra fields on the input (a title, a name) must not leak in.
        ...({ taskTitle: 'Fix a tap', workerName: 'Alex' } as object),
      }),
    ).toEqual({ task_id: 't1', worker_id: 'w1', surface: 'after_post' })
    expect(
      inviteSentProps({ taskId: 't1', workerUserId: 'w1', surface: 'profile' })
        .surface,
    ).toBe('profile')
  })

  it('quote_invite_failed carries the API code only, UNKNOWN without one', () => {
    expect(inviteFailedProps('QUOTE_INVITE_DAILY_LIMIT')).toEqual({
      code: 'QUOTE_INVITE_DAILY_LIMIT',
    })
    expect(inviteFailedProps(undefined)).toEqual({ code: 'UNKNOWN' })
    expect(inviteFailedProps(null)).toEqual({ code: 'UNKNOWN' })
  })

  it('quote_invite_dismissed and quote_invite_prompt_skipped carry the task', () => {
    expect(inviteDismissedProps('t1')).toEqual({ task_id: 't1' })
    expect(invitePromptSkippedProps('t1')).toEqual({ task_id: 't1' })
  })
})

import { describe, expect, it } from 'vitest'

import { REPORT_REASON_VALUES } from '@/ui/ReportDialog/reportFormSchema'

import {
  REPORT_ERROR_CODE,
  getReportErrorMessage,
  getReportRetryAfterSeconds,
  reportReturnPath,
  reportTargetType,
  toReportReason,
} from './createReport'

function gqlError(code: string, extensions?: Record<string, unknown>): unknown {
  return {
    graphQLErrors: [
      {
        message: code,
        extensions: { code, ...extensions },
      },
    ],
  }
}

const copy = {
  rateLimited: 'Wait {seconds}s.',
  rateLimitedGeneric: 'Wait a bit.',
  selfNotAllowed: 'Not your own.',
  targetNotFound: 'Gone.',
  loginRequired: 'Sign in.',
  errorFallback: 'Failed.',
}

describe('createReport helpers', () => {
  it('maps UI kinds to BE target types', () => {
    expect(reportTargetType('task')).toBe('TASK')
    expect(reportTargetType('worker')).toBe('WORKER')
  })

  it('keeps reason values aligned with the BE enum', () => {
    expect([...REPORT_REASON_VALUES]).toEqual([
      'SPAM',
      'HARASSMENT',
      'ILLEGAL_OR_PROHIBITED',
      'SCAM',
      'OTHER',
    ])
    expect(toReportReason('ILLEGAL_OR_PROHIBITED')).toBe(
      'ILLEGAL_OR_PROHIBITED',
    )
  })

  it('appends report=1 and the target id on the return path', () => {
    expect(reportReturnPath('abc', 'https://slashie.app/tasks/abc')).toBe(
      '/tasks/abc?report=1&reportTarget=abc',
    )
    expect(reportReturnPath('w1', 'https://slashie.app/workers/w1?x=1')).toBe(
      '/workers/w1?x=1&report=1&reportTarget=w1',
    )
  })

  it('maps rate-limit, self-report, and missing-target errors', () => {
    expect(
      getReportErrorMessage(
        gqlError(REPORT_ERROR_CODE.RATE_LIMITED, { retryAfterSeconds: 12.2 }),
        copy,
      ),
    ).toBe('Wait 13s.')
    expect(
      getReportErrorMessage(gqlError(REPORT_ERROR_CODE.RATE_LIMITED), copy),
    ).toBe('Wait a bit.')
    expect(
      getReportErrorMessage(gqlError(REPORT_ERROR_CODE.SELF_NOT_ALLOWED), copy),
    ).toBe('Not your own.')
    expect(
      getReportErrorMessage(gqlError(REPORT_ERROR_CODE.TARGET_NOT_FOUND), copy),
    ).toBe('Gone.')
    expect(getReportErrorMessage(gqlError('UNAUTHENTICATED'), copy)).toBe(
      'Sign in.',
    )
    expect(getReportRetryAfterSeconds(gqlError('OTHER'))).toBeNull()
  })
})

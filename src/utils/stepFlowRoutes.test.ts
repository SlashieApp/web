import { describe, expect, it } from 'vitest'

import { isStepFlowStandaloneRoute } from './stepFlowRoutes'

describe('isStepFlowStandaloneRoute', () => {
  it('matches worker setup with and without locale prefix', () => {
    expect(isStepFlowStandaloneRoute('/worker/setup')).toBe(true)
    expect(isStepFlowStandaloneRoute('/en/worker/setup')).toBe(true)
    expect(isStepFlowStandaloneRoute('/zh-hk/worker/setup')).toBe(true)
  })

  it('matches create-task and send-quote step flows', () => {
    expect(isStepFlowStandaloneRoute('/tasks/create')).toBe(true)
    expect(isStepFlowStandaloneRoute('/en/tasks/create')).toBe(true)
    expect(isStepFlowStandaloneRoute('/zh-hk/tasks/abc-123/quote')).toBe(true)
    expect(isStepFlowStandaloneRoute('/tasks/my-task/quote/')).toBe(true)
  })

  it('does not match browse, detail, or other worker routes', () => {
    expect(isStepFlowStandaloneRoute('/tasks')).toBe(false)
    expect(isStepFlowStandaloneRoute('/en/tasks')).toBe(false)
    expect(isStepFlowStandaloneRoute('/en/tasks/abc-123')).toBe(false)
    expect(isStepFlowStandaloneRoute('/en/tasks/abc-123/edit')).toBe(false)
    expect(isStepFlowStandaloneRoute('/en/workers/jane')).toBe(false)
    expect(isStepFlowStandaloneRoute('/en/worker/plan')).toBe(false)
    expect(isStepFlowStandaloneRoute(null)).toBe(false)
  })
})

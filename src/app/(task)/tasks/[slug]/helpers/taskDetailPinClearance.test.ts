import { describe, expect, it } from 'vitest'

import {
  TASK_DETAIL_PIN_CLEARANCE,
  taskDetailPinClearance,
} from './taskDetailPinClearance'

describe('taskDetailPinClearance', () => {
  it('uses the same compact height for every pin', () => {
    expect(taskDetailPinClearance('pricing')).toBe(TASK_DETAIL_PIN_CLEARANCE)
    expect(taskDetailPinClearance('share')).toBe(TASK_DETAIL_PIN_CLEARANCE)
    expect(taskDetailPinClearance('owner')).toBe(TASK_DETAIL_PIN_CLEARANCE)
    expect(taskDetailPinClearance('completion')).toBe(TASK_DETAIL_PIN_CLEARANCE)
    expect(taskDetailPinClearance(null)).toBe(TASK_DETAIL_PIN_CLEARANCE)
    expect(TASK_DETAIL_PIN_CLEARANCE).toContain('7.5rem')
  })
})

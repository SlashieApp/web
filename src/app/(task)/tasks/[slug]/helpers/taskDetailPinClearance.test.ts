import { describe, expect, it } from 'vitest'

import {
  TASK_DETAIL_CARD_PIN_CLEARANCE,
  TASK_DETAIL_CONTACT_PIN_CLEARANCE,
  TASK_DETAIL_CTA_CLEARANCE,
  taskDetailPinClearance,
} from './taskDetailPinClearance'

describe('taskDetailPinClearance', () => {
  it('extends clearance for taller pricing and share cards', () => {
    expect(taskDetailPinClearance('pricing')).toBe(
      TASK_DETAIL_CARD_PIN_CLEARANCE,
    )
    expect(taskDetailPinClearance('share')).toBe(TASK_DETAIL_CARD_PIN_CLEARANCE)
    expect(TASK_DETAIL_CARD_PIN_CLEARANCE).toContain('18rem')
  })

  it('uses a mid clearance for the worker owner+contact sticky bar', () => {
    expect(taskDetailPinClearance('owner')).toBe(
      TASK_DETAIL_CONTACT_PIN_CLEARANCE,
    )
    expect(TASK_DETAIL_CONTACT_PIN_CLEARANCE).toContain('11rem')
  })

  it('keeps the thin bar height for completion or no pin', () => {
    expect(taskDetailPinClearance('completion')).toBe(TASK_DETAIL_CTA_CLEARANCE)
    expect(taskDetailPinClearance(null)).toBe(TASK_DETAIL_CTA_CLEARANCE)
    expect(TASK_DETAIL_CTA_CLEARANCE).toContain('7.5rem')
  })
})

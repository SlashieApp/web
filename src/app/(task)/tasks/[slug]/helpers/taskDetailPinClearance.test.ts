import { describe, expect, it } from 'vitest'

import { TASK_DETAIL_PIN_CLEARANCE } from './taskDetailPinClearance'

describe('TASK_DETAIL_PIN_CLEARANCE', () => {
  it('clears the compact two-row pin and the safe area', () => {
    expect(TASK_DETAIL_PIN_CLEARANCE).toContain('7.5rem')
    expect(TASK_DETAIL_PIN_CLEARANCE).toContain('safe-area-inset-bottom')
  })
})

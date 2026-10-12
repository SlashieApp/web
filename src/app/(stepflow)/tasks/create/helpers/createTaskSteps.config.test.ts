import { describe, expect, it } from 'vitest'

import {
  CREATE_TASK_FIRST_SUB_STEP,
  createTaskFirstErroredSubStep,
  createTaskNextSubStep,
  createTaskPreviousSubStep,
} from './createTaskSteps.config'

describe('createTaskSteps.config', () => {
  it('starts on location, then basics', () => {
    expect(CREATE_TASK_FIRST_SUB_STEP).toBe('details.location')
    expect(createTaskPreviousSubStep('details.location')).toBeNull()
    expect(createTaskNextSubStep('details.location')).toBe('details.basics')
    expect(createTaskNextSubStep('details.basics')).toBe('details.timing')
  })

  it('jumps to the earliest step in flow order that owns an error', () => {
    expect(createTaskFirstErroredSubStep(['title', 'streetAddress'])).toBe(
      'details.location',
    )
    expect(createTaskFirstErroredSubStep(['budgetMajor', 'title'])).toBe(
      'details.basics',
    )
    expect(createTaskFirstErroredSubStep(['acceptedProhibitedUse'])).toBe(
      'publish.contact',
    )
    expect(createTaskFirstErroredSubStep([])).toBeNull()
  })
})

import { describe, expect, it } from 'vitest'

import {
  createTaskFirstErroredStep,
  createTaskIsStepUnlocked,
  createTaskNextStep,
  createTaskPreviousStep,
  createTaskProgress,
} from './createTaskSteps'

describe('create task steps', () => {
  it('goes map, details, timing, budget, then review', () => {
    expect(createTaskNextStep('location')).toBe('details')
    expect(createTaskNextStep('details')).toBe('timing')
    expect(createTaskNextStep('timing')).toBe('budget')
    expect(createTaskNextStep('budget')).toBe('review')
    expect(createTaskNextStep('review')).toBeNull()
  })

  it('goes back one step at a time, and nowhere from the map', () => {
    expect(createTaskPreviousStep('review')).toBe('budget')
    expect(createTaskPreviousStep('location')).toBeNull()
  })

  it('counts progress through the five steps', () => {
    expect(createTaskProgress('location')).toEqual({
      index: 1,
      total: 5,
      percent: 20,
    })
    expect(createTaskProgress('review')).toEqual({
      index: 5,
      total: 5,
      percent: 100,
    })
  })

  it('sends a missing field back to the step that asks for it', () => {
    expect(createTaskFirstErroredStep(['budgetMajor', 'title'])).toBe('details')
    expect(createTaskFirstErroredStep(['streetAddress'])).toBe('location')
    expect(createTaskFirstErroredStep([])).toBeNull()
  })

  it('opens a step once every step before it is done', () => {
    const done = new Set(['location', 'details'] as const)
    expect(createTaskIsStepUnlocked('timing', 'details', done)).toBe(true)
    expect(createTaskIsStepUnlocked('budget', 'details', done)).toBe(false)
    expect(createTaskIsStepUnlocked('location', 'timing', done)).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'

import { createTaskStep } from '../views'
import {
  createTaskFirstErroredStep,
  createTaskIsStepUnlocked,
  createTaskNextStep,
  createTaskPreviousStep,
  createTaskProgress,
} from './createTaskSteps'

describe('create task steps', () => {
  it('goes map, address, details, timing, photos, budget, then review', () => {
    expect(createTaskNextStep('location')).toBe('address')
    expect(createTaskNextStep('address')).toBe('details')
    expect(createTaskNextStep('details')).toBe('timing')
    expect(createTaskNextStep('timing')).toBe('photos')
    expect(createTaskNextStep('photos')).toBe('budget')
    expect(createTaskNextStep('budget')).toBe('review')
    expect(createTaskNextStep('review')).toBeNull()
  })

  it('goes back one step at a time, and nowhere from the map', () => {
    expect(createTaskPreviousStep('review')).toBe('budget')
    expect(createTaskPreviousStep('budget')).toBe('photos')
    expect(createTaskPreviousStep('photos')).toBe('timing')
    expect(createTaskPreviousStep('details')).toBe('address')
    expect(createTaskPreviousStep('address')).toBe('location')
    expect(createTaskPreviousStep('location')).toBeNull()
  })

  it('counts progress through the seven steps', () => {
    expect(createTaskProgress('location')).toEqual({
      index: 1,
      total: 7,
      percent: 14,
    })
    expect(createTaskProgress('address')).toEqual({
      index: 2,
      total: 7,
      percent: 29,
    })
    expect(createTaskProgress('photos')).toEqual({
      index: 5,
      total: 7,
      percent: 71,
    })
    expect(createTaskProgress('review')).toEqual({
      index: 7,
      total: 7,
      percent: 100,
    })
  })

  it('sends a missing field back to the step that asks for it', () => {
    expect(createTaskFirstErroredStep(['mapPlaceName'])).toBe('location')
    expect(createTaskFirstErroredStep(['locationLat', 'locationLng'])).toBe(
      'location',
    )
    expect(createTaskFirstErroredStep(['streetAddress'])).toBe('address')
    expect(createTaskFirstErroredStep(['budgetMajor', 'title'])).toBe('details')
    expect(createTaskFirstErroredStep(['preferredDate'])).toBe('timing')
    expect(createTaskFirstErroredStep(['budgetMajor'])).toBe('budget')
    expect(createTaskFirstErroredStep(['acceptedProhibitedUse'])).toBe('review')
    expect(createTaskFirstErroredStep([])).toBeNull()
  })

  it('goes to the earliest of several steps with a problem', () => {
    expect(createTaskFirstErroredStep(['title', 'streetAddress'])).toBe(
      'address',
    )
    expect(createTaskFirstErroredStep(['streetAddress', 'mapPlaceName'])).toBe(
      'location',
    )
  })

  it('never stops on the photos step: photos are optional, and not form fields', () => {
    expect(createTaskStep('photos').fields).toEqual([])
    expect(createTaskFirstErroredStep(['photos'])).toBeNull()
    // A problem on either side of the photos step skips it.
    expect(createTaskFirstErroredStep(['preferredTime', 'budgetMajor'])).toBe(
      'timing',
    )
    expect(createTaskFirstErroredStep(['budgetMajor', 'paymentMethod'])).toBe(
      'budget',
    )
  })

  it('opens a step once every step before it is done', () => {
    const done = new Set(['location', 'address', 'details'] as const)
    expect(createTaskIsStepUnlocked('timing', 'details', done)).toBe(true)
    expect(createTaskIsStepUnlocked('budget', 'details', done)).toBe(false)
    expect(createTaskIsStepUnlocked('location', 'timing', done)).toBe(true)
  })

  it('opens the budget once the photos step is passed, with or without photos', () => {
    const done = new Set(['location', 'address', 'details', 'timing'] as const)
    expect(createTaskIsStepUnlocked('photos', 'timing', done)).toBe(true)
    expect(createTaskIsStepUnlocked('budget', 'photos', done)).toBe(false)
    expect(
      createTaskIsStepUnlocked(
        'budget',
        'photos',
        new Set([...done, 'photos']),
      ),
    ).toBe(true)
  })

  it('opens the address step once the pin is set', () => {
    expect(
      createTaskIsStepUnlocked('address', 'location', new Set(['location'])),
    ).toBe(true)
    expect(createTaskIsStepUnlocked('address', 'location', new Set())).toBe(
      false,
    )
  })
})

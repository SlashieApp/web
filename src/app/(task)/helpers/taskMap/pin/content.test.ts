import { describe, expect, it } from 'vitest'

import type { TaskMapTask } from '../types'
import { pinAriaLabel, pinMilesText, pinPriceText } from './content'

const task = {
  id: 'task-1',
  title: 'Mount a TV',
  priceLabel: '£120',
  distanceLabel: '1.2 mi away',
} as TaskMapTask

describe('pin content', () => {
  it('uses price and distance for the pin label', () => {
    expect(pinPriceText(task)).toBe('£120')
    expect(pinMilesText(task)).toBe('1.2 mi away')
  })

  it('announces that activating the pin opens task detail', () => {
    expect(pinAriaLabel(task)).toBe('£120, 1.2 mi away. View task details.')
  })

  it('drops the distance slot without a reference location', () => {
    const noDistance = { ...task, distanceLabel: null }
    expect(pinMilesText(noDistance)).toBeNull()
    expect(pinMilesText({ ...task, distanceLabel: '  ' })).toBeNull()
    expect(pinAriaLabel(noDistance)).toBe('£120. View task details.')
  })
})

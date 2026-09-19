import { describe, expect, it } from 'vitest'

import type { TaskMapTask } from '../types'
import { pinAriaLabel, pinMilesText, pinPriceText } from './content'
import { pinLabelVisualState } from './marker'

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
})

describe('pinLabelVisualState', () => {
  it('expands the selected pin label and returns to compact when idle', () => {
    expect(pinLabelVisualState(true, false)).toEqual({
      selected: true,
      expanded: true,
      showPill: false,
    })
    expect(pinLabelVisualState(false, false)).toEqual({
      selected: false,
      expanded: false,
      showPill: true,
    })
    expect(pinLabelVisualState(false, true)).toEqual({
      selected: false,
      expanded: true,
      showPill: false,
    })
  })
})

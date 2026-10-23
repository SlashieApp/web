import { describe, expect, it } from 'vitest'

import { mapPinTapAction } from './mapPinTapAction'

describe('mapPinTapAction', () => {
  it('selects the task on the first tap, when nothing is selected', () => {
    expect(mapPinTapAction('task-1', null)).toBe('select')
    expect(mapPinTapAction('task-1', undefined)).toBe('select')
  })

  it('selects the tapped task when a different one is selected', () => {
    expect(mapPinTapAction('task-2', 'task-1')).toBe('select')
  })

  it('opens the task when its pin is tapped while it is selected', () => {
    expect(mapPinTapAction('task-1', 'task-1')).toBe('open')
  })

  it('compares the whole id', () => {
    expect(mapPinTapAction('task-1', 'task-10')).toBe('select')
    expect(mapPinTapAction('task-10', 'task-1')).toBe('select')
    expect(mapPinTapAction('Task-1', 'task-1')).toBe('select')
  })
})

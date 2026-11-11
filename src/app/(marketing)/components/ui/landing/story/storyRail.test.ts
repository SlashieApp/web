import { describe, expect, it } from 'vitest'

import {
  RAIL_HOLD,
  railAnchor,
  railIndex,
  railPosition,
  railTravel,
} from './storyRail'

describe('the sideways story', () => {
  it('takes a hold for every step and a move between each pair', () => {
    expect(railTravel(5)).toBe(4 + RAIL_HOLD)
    expect(railTravel(3)).toBe(2 + RAIL_HOLD)
    expect(railTravel(1)).toBe(RAIL_HOLD)
  })

  it('holds each card still, then moves it on', () => {
    // The first hold: the first card in place.
    expect(railPosition(0, 5)).toBe(0)
    expect(railPosition(RAIL_HOLD / 2, 5)).toBe(0)
    expect(railPosition(RAIL_HOLD, 5)).toBe(0)
    // Halfway through the move: halfway to the next card.
    expect(railPosition(RAIL_HOLD + (1 - RAIL_HOLD) / 2, 5)).toBeCloseTo(0.5)
    // The next step starts with its card in place.
    expect(railPosition(1, 5)).toBe(1)
    expect(railPosition(1 + RAIL_HOLD / 2, 5)).toBe(1)
  })

  it('never runs past the first or the last card', () => {
    expect(railPosition(-3, 5)).toBe(0)
    expect(railPosition(4, 5)).toBe(4)
    expect(railPosition(4 + RAIL_HOLD, 5)).toBe(4)
    expect(railPosition(40, 5)).toBe(4)
    expect(railPosition(Number.NaN, 5)).toBe(0)
    expect(railPosition(2, 1)).toBe(0)
  })

  it('moves forward only as the visitor scrolls forward', () => {
    let last = -1
    for (let raw = 0; raw <= railTravel(5); raw += 0.01) {
      const position = railPosition(raw, 5)
      expect(position).toBeGreaterThanOrEqual(last)
      last = position
    }
  })

  it('names the card nearest its place as the step in view', () => {
    expect(railIndex(0, 5)).toBe(0)
    expect(railIndex(0.49, 5)).toBe(0)
    expect(railIndex(0.5, 5)).toBe(1)
    expect(railIndex(9, 5)).toBe(4)
    expect(railIndex(-1, 5)).toBe(0)
  })

  it('lands a link on its step, mid-hold', () => {
    for (let index = 0; index < 5; index++) {
      const raw = railAnchor(index)
      expect(railPosition(raw, 5)).toBe(index)
      expect(railIndex(railPosition(raw, 5), 5)).toBe(index)
    }
  })
})

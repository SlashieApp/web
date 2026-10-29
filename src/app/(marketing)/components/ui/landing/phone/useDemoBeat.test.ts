import { describe, expect, it } from 'vitest'

import { reducedBeat } from './useDemoBeat'

describe('reducedBeat', () => {
  it('jumps a screen to its finished state: entered and played', () => {
    expect(reducedBeat(true)).toEqual({ entered: true, done: true })
  })

  it('rests a screen that should show its starting state in that state', () => {
    // The post screen: its finished state swaps the app bar for a toast.
    expect(reducedBeat(false)).toEqual({ entered: true, done: false })
  })
})

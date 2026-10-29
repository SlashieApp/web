import { describe, expect, it } from 'vitest'

import { reducedBeat } from './useDemoBeat'

describe('reducedBeat', () => {
  it('jumps a screen to its finished state: entered and played', () => {
    expect(reducedBeat(true)).toEqual({ entered: true, done: true })
  })

  it('rests a screen whose finished state covers its content in its starting state', () => {
    // The post screen: its toast would sit over the first field.
    expect(reducedBeat(false)).toEqual({ entered: true, done: false })
  })
})

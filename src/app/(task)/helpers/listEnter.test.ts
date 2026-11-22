import { describe, expect, it } from 'vitest'

import { sdlMotion } from '@/theme/styles'

import { LIST_ENTER, listEnterDelay } from './listEnter'

/** Motion group D (Ryan 22 Nov): everyday motion stays under 300ms. */
describe('a list’s cards arrive quickly', () => {
  it('a card takes the shared 200ms on the decelerate curve', () => {
    expect(`${LIST_ENTER.seconds * 1000}ms`).toBe(sdlMotion.duration.moderate)
    expect(`cubic-bezier(${LIST_ENTER.ease.join(', ')})`).toBe(
      sdlMotion.easing.decelerate,
    )
  })

  it('cards follow 60ms apart, and none waits more than 200ms', () => {
    expect(listEnterDelay(0)).toBe(0)
    expect(listEnterDelay(1)).toBeCloseTo(0.06)
    expect(listEnterDelay(3)).toBeCloseTo(0.18)
    expect(listEnterDelay(4)).toBe(0.2)
    expect(listEnterDelay(40)).toBe(0.2)
  })

  it('the last card has landed within 400ms of the first starting', () => {
    const worst = listEnterDelay(99) + LIST_ENTER.seconds
    expect(worst).toBeLessThanOrEqual(0.4)
  })
})

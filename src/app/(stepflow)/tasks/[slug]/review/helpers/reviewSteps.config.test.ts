import { describe, expect, it } from 'vitest'

import {
  reviewNextStep,
  reviewPreviousStep,
  reviewProgressPercent,
} from './reviewSteps.config'

describe('review steps', () => {
  it('walks stars, then comment, then submit', () => {
    expect(reviewNextStep('stars')).toBe('comment')
    expect(reviewNextStep('comment')).toBe('submit')
    expect(reviewNextStep('submit')).toBeNull()
    expect(reviewPreviousStep('submit')).toBe('comment')
    expect(reviewPreviousStep('stars')).toBeNull()
  })

  it('fills the progress bar across three steps', () => {
    expect(reviewProgressPercent('stars')).toBe(33)
    expect(reviewProgressPercent('comment')).toBe(67)
    expect(reviewProgressPercent('submit')).toBe(100)
  })
})

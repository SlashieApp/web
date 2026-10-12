import { describe, expect, it } from 'vitest'

import { STORY_STAGES } from '../story/storyState'
import { COMPACT_OBJECTS, SCENE_OBJECTS, poseFor } from './formations'

describe('poseFor', () => {
  it('gives every object a finite pose at every stage, wide and compact', () => {
    for (const stage of STORY_STAGES) {
      for (const id of SCENE_OBJECTS) {
        for (const compact of [false, true]) {
          const pose = poseFor(id, stage, compact)
          for (const value of Object.values(pose)) {
            expect(Number.isFinite(value)).toBe(true)
          }
          expect(pose.s).toBeGreaterThan(0)
        }
      }
    }
  })

  it('pulls the step object toward the phone on wide screens only', () => {
    const quotes = poseFor('boxes', 'quotes', false)
    const chat = poseFor('boxes', 'chat', false)
    expect(quotes.z).toBeGreaterThan(chat.z)
    expect(quotes.s).toBeGreaterThan(chat.s)
    // Compact screens never focus: the phone is inline there.
    expect(poseFor('boxes', 'quotes', true).z).toBe(
      poseFor('boxes', 'chat', true).z,
    )
  })

  it('turns objects a little on every step', () => {
    const post = poseFor('toolbox', 'post', false)
    const quotes = poseFor('toolbox', 'quotes', false)
    expect(quotes.ry).toBeGreaterThan(post.ry)
  })

  it('keeps the compact set a subset of the full set', () => {
    for (const id of COMPACT_OBJECTS) expect(SCENE_OBJECTS).toContain(id)
  })
})

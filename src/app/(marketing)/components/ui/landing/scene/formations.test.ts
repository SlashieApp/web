import { describe, expect, it } from 'vitest'

import { STORY_STAGES } from '../story/storyState'
import {
  CAMERA_Z,
  COMPACT_OBJECTS,
  REFERENCE_HEIGHT_PX,
  SCENE_OBJECTS,
  WIDE_X_LIMIT_PX,
  limitX,
  poseFor,
} from './formations'

/** Today's six-object scene had a toolbox of scale 1 in the hero; the props are about 70% of that. */
const OLD_HERO_TOOLBOX_SCALE = 1

describe('the scene objects', () => {
  it('are the toolbox, the boxes and the map pin, and nothing else', () => {
    expect([...SCENE_OBJECTS]).toEqual(['toolbox', 'boxes', 'pin'])
  })

  it('keep two of them below lg, and only ones the scene has', () => {
    expect(COMPACT_OBJECTS).toHaveLength(2)
    for (const id of COMPACT_OBJECTS) expect(SCENE_OBJECTS).toContain(id)
  })
})

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

  it('keeps the props to about 70% of the old size, the step object included', () => {
    for (const stage of STORY_STAGES) {
      for (const id of SCENE_OBJECTS) {
        for (const compact of [false, true]) {
          // The old scene went up to 1.05 x 1.2 for a focused toolbox.
          expect(poseFor(id, stage, compact).s).toBeLessThanOrEqual(
            OLD_HERO_TOOLBOX_SCALE * 0.75,
          )
        }
      }
    }
    // The hero is where they are biggest: 70% of the old 1, 0.95 and 0.8.
    expect(poseFor('toolbox', 'hero', false).s).toBeCloseTo(0.7, 1)
    expect(poseFor('boxes', 'hero', false).s).toBeCloseTo(0.67, 1)
    expect(poseFor('pin', 'hero', false).s).toBeCloseTo(0.56, 1)
  })

  it('is smaller on a phone than on a laptop', () => {
    for (const stage of STORY_STAGES) {
      for (const id of COMPACT_OBJECTS) {
        expect(poseFor(id, stage, true).s).toBeLessThan(
          poseFor(id, stage, false).s,
        )
      }
    }
  })

  it('brings the step object forward, bigger, on wide screens only', () => {
    const quotes = poseFor('boxes', 'quotes', false)
    const chat = poseFor('boxes', 'chat', false)
    expect(quotes.z).toBeGreaterThan(chat.z)
    expect(quotes.s).toBeGreaterThan(chat.s)
    // Compact screens never focus: the phone is inline there.
    expect(poseFor('boxes', 'quotes', true).z).toBe(
      poseFor('boxes', 'chat', true).z,
    )
    expect(poseFor('boxes', 'quotes', true).s).toBe(
      poseFor('boxes', 'chat', true).s,
    )
  })

  it('brings the step object forward in place: it keeps its spot on the screen', () => {
    // A prop nearer the camera drifts outward, so the focus pose scales x and y
    // back: the projected spot stays the same and the prop never leaves the screen.
    const projected = (pose: { x: number; y: number; z: number }) => ({
      x: (pose.x * CAMERA_Z) / (CAMERA_Z - pose.z),
      y: (pose.y * CAMERA_Z) / (CAMERA_Z - pose.z),
    })
    // [object, a stage that brings it forward, a stage of the same formation that does not]
    for (const [id, focus, rest] of [
      ['pin', 'post', 'chat'],
      ['boxes', 'quotes', 'chat'],
      ['toolbox', 'hire', 'chat'],
      ['pin', 'workerFind', 'workerQuote'],
      ['boxes', 'workerQuote', 'workerFind'],
      ['toolbox', 'workerProfile', 'workerFind'],
    ] as const) {
      const focused = poseFor(id, focus, false)
      const resting = poseFor(id, rest, false)
      expect(focused.z).toBeGreaterThan(resting.z)
      expect(projected(focused).x).toBeCloseTo(projected(resting).x, 5)
      expect(projected(focused).y).toBeCloseTo(projected(resting).y, 5)
    }
  })

  it('keeps the hero props their distance from the top on any screen height', () => {
    // The hero's text and the map panel under it are fixed px from the top.
    const fromTop = (
      id: (typeof SCENE_OBJECTS)[number],
      compact: boolean,
      h: number,
    ) => (0.5 - poseFor(id, 'hero', compact, h).y) * h
    for (const compact of [false, true]) {
      for (const id of SCENE_OBJECTS) {
        const reference = fromTop(id, compact, REFERENCE_HEIGHT_PX)
        for (const height of [568, 720, 844, 1024, 1080, 1440]) {
          expect(fromTop(id, compact, height)).toBeCloseTo(reference, 5)
        }
      }
    }
  })

  it('leaves the other formations a fraction of the screen, whatever its height', () => {
    for (const stage of STORY_STAGES.filter((stage) => stage !== 'hero')) {
      for (const id of SCENE_OBJECTS) {
        expect(poseFor(id, stage, false, 600)).toEqual(
          poseFor(id, stage, false, 1200),
        )
      }
    }
  })

  it('turns objects a little on every step', () => {
    const post = poseFor('toolbox', 'post', false)
    const quotes = poseFor('toolbox', 'quotes', false)
    expect(quotes.ry).toBeGreaterThan(post.ry)
  })

  it('sways the pin about its pose and never turns it edge-on', () => {
    for (const stage of STORY_STAGES) {
      for (const compact of [false, true]) {
        // A flat slab turned past about 60 degrees is a sliver.
        expect(Math.abs(poseFor('pin', stage, compact).ry)).toBeLessThan(1)
      }
    }
  })

  it('keeps the props at the right edge in the acts, clear of the steps and the phone', () => {
    // The steps are on the left and the phone in the right column, so on wide
    // screens every prop in an act sits right of centre, near the edge.
    for (const stage of [
      'post',
      'quotes',
      'chat',
      'hire',
      'review',
      'workerFind',
      'workerQuote',
      'workerProfile',
    ] as const) {
      for (const id of SCENE_OBJECTS) {
        expect(poseFor(id, stage, false).x).toBeGreaterThanOrEqual(0.4)
      }
    }
  })

  it('flanks the hero text and the close outside the centred column', () => {
    for (const stage of ['hero', 'cta'] as const) {
      for (const id of ['toolbox', 'boxes'] as const) {
        expect(Math.abs(poseFor(id, stage, false).x)).toBeGreaterThanOrEqual(
          0.35,
        )
      }
    }
  })
})

describe('limitX', () => {
  it('leaves a position inside the page column alone', () => {
    expect(limitX(300, false)).toBe(300)
    expect(limitX(-WIDE_X_LIMIT_PX, false)).toBe(-WIDE_X_LIMIT_PX)
  })

  it('holds a position past the page column at its edge, either side', () => {
    expect(limitX(900, false)).toBe(WIDE_X_LIMIT_PX)
    expect(limitX(-900, false)).toBe(-WIDE_X_LIMIT_PX)
  })

  it('never limits a compact screen', () => {
    expect(limitX(900, true)).toBe(900)
  })
})

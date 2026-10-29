import { describe, expect, it } from 'vitest'

import { STORY_STAGES } from '../story/storyState'
import {
  CAMERA_Z,
  COMPACT_OBJECTS,
  FOOTER_MARGIN_PX,
  HEADER_MARGIN_PX,
  PAGE_COLUMN_PX,
  PEEK_CLEARANCE_PX,
  PROP_REACH,
  RAIL_MARGIN_PX,
  REFERENCE_HEIGHT_PX,
  SCENE_OBJECTS,
  WORLD_HEIGHT,
  closeLiftPx,
  fitFor,
  peekLayoutFor,
  peekReachPx,
  placeX,
  placementFor,
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

describe('the compact formations', () => {
  it('keep each prop on one side in every formation, so none glides across the text', () => {
    for (const id of COMPACT_OBJECTS) {
      const sides = new Set(
        STORY_STAGES.map((stage) => Math.sign(poseFor(id, stage, true).x)),
      )
      // Hero and the acts, the waiting place and the close: one side each.
      expect(sides.size, id).toBe(1)
    }
    // The toolbox is on the left and the pin on the right.
    expect(poseFor('toolbox', 'quotes', true).x).toBeLessThan(0)
    expect(poseFor('pin', 'quotes', true).x).toBeGreaterThan(0)
  })

  it('swap the props heights, not their sides, in the worker act', () => {
    expect(poseFor('toolbox', 'workerFind', true).y).not.toBe(
      poseFor('toolbox', 'quotes', true).y,
    )
  })
})

describe('parked props', () => {
  it('wait off the screen edges while the opaque panels pass, on both layouts', () => {
    for (const compact of [false, true]) {
      for (const stage of ['trust', 'pricing'] as const) {
        expect(placementFor(stage, compact)).toBe('parked')
        for (const id of compact ? COMPACT_OBJECTS : SCENE_OBJECTS) {
          expect(
            Math.abs(poseFor(id, stage, compact).x),
            `${id}`,
          ).toBeGreaterThan(0.5)
        }
      }
    }
  })
})

describe('placementFor', () => {
  it('holds a wide screen to the page column and a phone to the edges', () => {
    expect(placementFor('hero', false)).toBe('column')
    expect(placementFor('quotes', false)).toBe('column')
    expect(placementFor('cta', false)).toBe('column')
    // The hero's text leaves room beside its last row on a phone.
    expect(placementFor('hero', true)).toBe('free')
    expect(placementFor('quotes', true)).toBe('peek')
    expect(placementFor('workerQuote', true)).toBe('peek')
    expect(placementFor('cta', true)).toBe('peek')
  })

  it('lays the close out as a centred column and the acts as steps', () => {
    expect(peekLayoutFor('cta')).toBe('centred')
    expect(peekLayoutFor('quotes')).toBe('steps')
  })
})

describe('placeX, in the page column', () => {
  const place = (xPx: number, halfPx: number, viewportPx: number) =>
    placeX({ xPx, halfPx, viewportPx, placement: 'column' })

  it('leaves a prop that fits inside the rails alone', () => {
    expect(place(300, 90, 1366)).toBe(300)
    expect(place(-300, 90, 1366)).toBe(-300)
  })

  it('holds the whole prop inside the rails, not its centre', () => {
    // The page column is 640px a side: the prop's outer edge stops 16px short.
    const limit = PAGE_COLUMN_PX / 2 - RAIL_MARGIN_PX - 100
    expect(place(900, 100, 1920)).toBe(limit)
    expect(place(-900, 100, 1920)).toBe(-limit)
    // So its outer edge is inside the rail whatever its width.
    for (const half of [60, 100, 115]) {
      const x = place(900, half, 1920)
      expect(x + half).toBeLessThanOrEqual(PAGE_COLUMN_PX / 2 - RAIL_MARGIN_PX)
    }
  })

  it('uses the screen as the column where the screen is narrower', () => {
    // 1100px wide: the rails are at the screen's edges.
    expect(place(900, 80, 1100)).toBe(1100 / 2 - RAIL_MARGIN_PX - 80)
  })

  it('holds a prop wider than the column at the centre', () => {
    expect(place(300, 1000, 1366)).toBe(0)
  })
})

describe('peekReachPx', () => {
  it('is the gutter, less a little air, on a phone, both sides', () => {
    expect(peekReachPx(390, 'left', 'steps')).toBe(16 - PEEK_CLEARANCE_PX)
    expect(peekReachPx(390, 'right', 'steps')).toBe(16 - PEEK_CLEARANCE_PX)
  })

  it('opens the free strip beside the steps on a tablet, on the right only', () => {
    // The steps start at the 24px gutter and end 38rem (608px) on.
    expect(peekReachPx(768, 'left', 'steps')).toBe(24 - PEEK_CLEARANCE_PX)
    expect(peekReachPx(768, 'right', 'steps')).toBe(
      768 - 24 - 608 - PEEK_CLEARANCE_PX,
    )
  })

  it('is symmetrical beside the centred close', () => {
    expect(peekReachPx(768, 'left', 'centred')).toBe(
      peekReachPx(768, 'right', 'centred'),
    )
    expect(peekReachPx(768, 'left', 'centred')).toBe(
      (768 - 640) / 2 - PEEK_CLEARANCE_PX,
    )
  })

  it('is never negative', () => {
    for (const width of [320, 360, 390, 480, 768, 1023]) {
      for (const layout of ['steps', 'centred'] as const) {
        for (const side of ['left', 'right'] as const) {
          expect(peekReachPx(width, side, layout)).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })
})

describe('placeX, peeking', () => {
  const peek = (
    xPx: number,
    halfPx: number,
    viewportPx: number,
    layout: 'steps' | 'centred' = 'steps',
  ) => placeX({ xPx, halfPx, viewportPx, placement: 'peek', layout })

  /** How far in from the screen's edge the prop's inner edge reaches. */
  const shown = (x: number, half: number, viewport: number) =>
    x < 0 ? x + half + viewport / 2 : viewport / 2 - (x - half)

  it('shows exactly the reach of the prop, on the side the pose is on', () => {
    for (const viewport of [320, 390, 430, 768, 1000]) {
      for (const half of [28, 47, 64]) {
        for (const layout of ['steps', 'centred'] as const) {
          const left = peek(-0.52 * viewport, half, viewport, layout)
          const right = peek(0.52 * viewport, half, viewport, layout)
          const want = (side: 'left' | 'right') =>
            Math.min(peekReachPx(viewport, side, layout), 2 * half)
          expect(
            shown(left, half, viewport),
            `left ${viewport}/${half}`,
          ).toBeCloseTo(want('left'), 9)
          expect(
            shown(right, half, viewport),
            `right ${viewport}/${half}`,
          ).toBeCloseTo(want('right'), 9)
        }
      }
    }
  })

  it('puts the prop on the side its pose is on, and does not care how far out the pose is', () => {
    expect(peek(-10, 40, 390)).toBe(peek(-9999, 40, 390))
    expect(peek(10, 40, 390)).toBe(peek(9999, 40, 390))
    expect(peek(-10, 40, 390)).toBeLessThan(0)
    expect(peek(10, 40, 390)).toBeGreaterThan(0)
  })

  it('shows all of a prop that is narrower than the strip', () => {
    // A tablet's right strip is 132px: a 50px prop shows whole, flush with the margin of air.
    const x = peek(400, 25, 768)
    expect(shown(x, 25, 768)).toBe(50)
  })

  it('leaves the other placements alone', () => {
    for (const placement of ['free', 'parked'] as const) {
      expect(placeX({ xPx: 123, halfPx: 80, viewportPx: 390, placement })).toBe(
        123,
      )
    }
  })

  it('keeps the toolbox in the acts out of the page gutter at 390 and 768', () => {
    // The case the review found: the toolbox on the left reached 39px in at 390
    // (23px past the 16px gutter) and 42px in at 768 (the gutter is 24px). Its
    // half width on screen is about 0.35 x 1.1 x px per unit.
    for (const [viewport, heightPx, gutter] of [
      [390, 844, 16],
      [768, 1024, 24],
    ] as const) {
      const perUnit = heightPx / 6.882
      const half = PROP_REACH.toolbox.halfWidth * 0.35 * perUnit
      const x = peek(
        poseFor('toolbox', 'quotes', true).x * viewport,
        half,
        viewport,
      )
      expect(shown(x, half, viewport)).toBeLessThanOrEqual(
        gutter - PEEK_CLEARANCE_PX + 1e-9,
      )
    }
  })
})

describe('closeLiftPx', () => {
  const at = (
    compact: boolean,
    widthPx: number,
    heightPx: number,
    footerTopPx: number | null,
  ) =>
    closeLiftPx({
      ids: compact ? COMPACT_OBJECTS : SCENE_OBJECTS,
      compact,
      widthPx,
      heightPx,
      footerTopPx,
      headerPx: 64,
    })

  /** Each prop's bottom (shadow included) and top on screen after the lift, in px from the top. */
  function extents(
    compact: boolean,
    widthPx: number,
    heightPx: number,
    lift: number,
  ) {
    const perUnit = heightPx / WORLD_HEIGHT
    const fit = fitFor(compact, widthPx / heightPx)
    return (compact ? COMPACT_OBJECTS : SCENE_OBJECTS).map((id) => {
      const pose = poseFor(id, 'cta', compact, heightPx)
      const near = CAMERA_Z / (CAMERA_Z - pose.z)
      const px = perUnit * near * pose.s * fit
      const centre = heightPx / 2 - pose.y * heightPx * near - lift
      return {
        id,
        top: centre - PROP_REACH[id].above * px,
        bottom: centre + PROP_REACH[id].below * px,
      }
    })
  }

  it('does not lift the props while no footer is on screen', () => {
    expect(at(false, 1366, 900, null)).toBe(0)
  })

  it('does not lift props that are already clear of the footer', () => {
    expect(at(false, 1366, 900, 5000)).toBe(0)
    expect(at(true, 390, 844, 5000)).toBe(0)
  })

  it('lifts the close off the footer on a laptop screen, shadows and all', () => {
    // The review's case: 1366 x 900, the footer's top edge at y = 434.
    const lift = at(false, 1366, 900, 434)
    expect(lift).toBeGreaterThan(0)
    for (const { id, bottom } of extents(false, 1366, 900, lift)) {
      expect(bottom, id).toBeLessThanOrEqual(434 - FOOTER_MARGIN_PX + 1e-6)
    }
  })

  it('fits the close between the header and the footer on a laptop screen', () => {
    // The footer is about 466px tall, so at the end of the page its top edge is
    // that far up from the screen's foot. Both the review's 1366 x 900 and a 1440
    // x 900 leave room for the whole formation: nothing under the header (the
    // hammer was cut by it before the pin's low pose and the toolbox's height
    // were allowed for), nothing under the footer.
    for (const width of [1366, 1440, 1536]) {
      const footerTop = 900 - 466
      const lift = at(false, width, 900, footerTop)
      for (const { id, top, bottom } of extents(false, width, 900, lift)) {
        expect(top, `${id} at ${width}`).toBeGreaterThanOrEqual(
          64 + HEADER_MARGIN_PX - 1e-6,
        )
        expect(bottom, `${id} at ${width}`).toBeLessThanOrEqual(
          footerTop - FOOTER_MARGIN_PX + 1e-6,
        )
      }
    }
  })

  it('lifts the props together, so the formation keeps its shape', () => {
    // One number for the whole close: the pin stays under the boxes.
    const before = extents(false, 1366, 900, 0)
    const lift = at(false, 1366, 900, 434)
    const after = extents(false, 1366, 900, lift)
    for (const [index, { id }] of before.entries()) {
      expect(after[index].bottom - before[index].bottom, id).toBeCloseTo(
        -lift,
        9,
      )
    }
  })

  it('never lifts a prop up under the header, whatever the footer does', () => {
    // A footer so high there is no room: the header wins.
    const lift = at(false, 1366, 900, 120)
    for (const { id, top } of extents(false, 1366, 900, lift)) {
      expect(top, id).toBeGreaterThanOrEqual(64 + HEADER_MARGIN_PX - 1e-6)
    }
  })

  it('holds on a phone and a tablet too', () => {
    for (const [width, height, footerTop] of [
      [390, 844, 300],
      [768, 1024, 270],
    ] as const) {
      const lift = at(true, width, height, footerTop)
      for (const { id, bottom } of extents(true, width, height, lift)) {
        expect(bottom, `${id} at ${width}`).toBeLessThanOrEqual(
          footerTop - FOOTER_MARGIN_PX + 1e-6,
        )
      }
    }
  })
})

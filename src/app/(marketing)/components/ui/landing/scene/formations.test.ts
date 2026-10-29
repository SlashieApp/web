import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { STORY_STAGES } from '../story/storyState'
import {
  CAMERA_Z,
  CLOSE_MIN_FIT,
  COMPACT_OBJECTS,
  FOOTER_MARGIN_PX,
  HEADER_MARGIN_PX,
  PAGE_COLUMN_PX,
  PARKED_STAGE,
  PEEK_CLEARANCE_PX,
  PHONE_CLEARANCE_PX,
  PROP_MIN_FIT,
  PROP_REACH,
  RAIL_MARGIN_PX,
  REFERENCE_HEIGHT_PX,
  SCENE_OBJECTS,
  STRIP_MIN_PX,
  WORLD_HEIGHT,
  closeFitPx,
  fitFor,
  peekLayoutFor,
  peekReachPx,
  phoneStripPx,
  phoneWidthPx,
  placeProp,
  placeX,
  placementFor,
  poseFor,
  railMarginStripPx,
  sceneStage,
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
    expect(placementFor('cta', false)).toBe('column')
    // The acts hold the prop whole in the strip beside the phone.
    expect(placementFor('quotes', false)).toBe('strip')
    expect(placementFor('workerQuote', false)).toBe('strip')
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
    // Where the strip shows at least the least share of the prop (`PROP_MIN_FIT`).
    let checked = 0
    for (const viewport of [390, 430, 600, 768, 1000]) {
      for (const half of [28, 47, 64]) {
        for (const layout of ['steps', 'centred'] as const) {
          for (const side of ['left', 'right'] as const) {
            const reach = peekReachPx(viewport, side, layout)
            if (reach < PROP_MIN_FIT * 2 * half) continue
            const x = peek(
              (side === 'left' ? -0.52 : 0.52) * viewport,
              half,
              viewport,
              layout,
            )
            expect(
              shown(x, half, viewport),
              `${side} ${viewport}/${half}`,
            ).toBeCloseTo(Math.min(reach, 2 * half), 9)
            checked += 1
          }
        }
      }
    }
    expect(checked).toBeGreaterThan(6)
  })

  it('puts the prop on the side its pose is on, and does not care how far out the pose is', () => {
    // A tablet's right strip shows a whole small prop; both poses far out agree.
    expect(peek(10, 25, 768)).toBe(peek(9999, 25, 768))
    expect(peek(10, 25, 768)).toBeGreaterThan(0)
    expect(peek(-10, 40, 390)).toBe(peek(-9999, 40, 390))
    expect(peek(-10, 40, 390)).toBeLessThan(0)
  })

  it('shows all of a prop that is narrower than the strip', () => {
    // A tablet's right strip is 132px: a 50px prop shows whole, flush with the margin of air.
    const x = peek(400, 25, 768)
    expect(shown(x, 25, 768)).toBe(50)
  })

  it('shows none of a prop where the strip would show only a sliver', () => {
    // A phone's strip is the 16px gutter less the air: 12px of a 100px prop.
    // That read as a rendering fault, so the prop waits just off the edge.
    for (const viewport of [320, 390, 430]) {
      const half = 50
      const left = peek(-0.52 * viewport, half, viewport)
      const right = peek(0.52 * viewport, half, viewport)
      expect(left + half, `left ${viewport}`).toBeLessThanOrEqual(-viewport / 2)
      expect(right - half, `right ${viewport}`).toBeGreaterThanOrEqual(
        viewport / 2,
      )
    }
  })

  it('keeps the toolbox in the acts off the screen at 390 and 768, and the page gutter clear', () => {
    // The toolbox is on the left, where the steps start at the gutter (16px on a
    // phone, 24px on a tablet): its strip is too narrow to show the toolbox
    // (about 105px at 390 and 130 at 768), so it waits off the left edge.
    for (const [viewport, heightPx] of [
      [390, 844],
      [768, 1024],
    ] as const) {
      const perUnit = heightPx / WORLD_HEIGHT
      const half = PROP_REACH.toolbox.halfWidth * 0.35 * perUnit
      const x = peek(
        poseFor('toolbox', 'quotes', true).x * viewport,
        half,
        viewport,
      )
      expect(shown(x, half, viewport)).toBeLessThanOrEqual(0)
    }
  })

  it('shows the pin whole beside the steps on a tablet, where the right strip holds it', () => {
    const perUnit = 1024 / WORLD_HEIGHT
    const half = PROP_REACH.pin.halfWidth * 0.32 * perUnit
    const x = peek(poseFor('pin', 'quotes', true).x * 768, half, 768)
    expect(shown(x, half, 768)).toBeCloseTo(2 * half, 9)
  })

  it('leaves the other placements alone', () => {
    for (const placement of ['free', 'parked'] as const) {
      expect(placeX({ xPx: 123, halfPx: 80, viewportPx: 390, placement })).toBe(
        123,
      )
    }
  })
})

describe('phoneStripPx', () => {
  it('follows the pinned phone: up to 300px, shorter on short screens', () => {
    expect(phoneWidthPx(900)).toBe(300)
    expect(phoneWidthPx(768)).toBeCloseTo((768 - 150) / 2.1, 9)
    expect(phoneWidthPx(600)).toBeLessThan(phoneWidthPx(768))
  })

  it('mirrors the CSS the phone and the story grid are laid out with', () => {
    const read = (path: string) =>
      readFileSync(join(process.cwd(), path), 'utf8')
    const landing = 'src/app/(marketing)/components/ui/landing'
    expect(read(`${landing}/phone/PhoneDemo.tsx`)).toContain(
      "STICKY_PHONE_W = 'min(300px, calc((100vh - 150px) / 2.1))'",
    )
    const story = read(`${landing}/story/LandingStory.tsx`)
    expect(story).toContain("lg: 'minmax(0, 1fr) 22rem'")
    expect(story).toContain("xl: 'repeat(2, minmax(0, 1fr))'")
    expect(story).toContain('columnGap={{ lg: 12, xl: 16 }}')
  })

  it('is a thin strip on a 1024 to 1279px laptop and about 150px from 1280px', () => {
    // The review's cases: 30px of toolbox beside the phone at 1024, the free
    // strip 169px at 1366 against props that are wider.
    for (const [width, height] of [
      [1024, 768],
      [1100, 800],
      [1279, 800],
    ] as const) {
      const { from, to } = phoneStripPx(width, height)
      expect(to - from, `${width}`).toBeLessThan(STRIP_MIN_PX + 20)
    }
    for (const [width, height] of [
      [1280, 720],
      [1366, 768],
      [1536, 864],
      [1920, 1080],
    ] as const) {
      const { from, to } = phoneStripPx(width, height)
      expect(to - from, `${width}`).toBeGreaterThan(140)
      expect(to - from, `${width}`).toBeLessThan(200)
    }
  })

  it('starts at the phone frame and ends inside the right rail', () => {
    const { from, to } = phoneStripPx(1366, 768)
    // The page column is 1280px: its rail is 640px from the centre.
    expect(to).toBe(PAGE_COLUMN_PX / 2 - RAIL_MARGIN_PX)
    // The phone is 294px wide, centred in the 576px right column of the content.
    const phoneCentre = 640 - 32 - 576 / 2
    expect(from).toBeCloseTo(
      phoneCentre + phoneWidthPx(768) / 2 + PHONE_CLEARANCE_PX,
      9,
    )
  })
})

describe('placeProp, in the strip beside the phone', () => {
  /** A prop's half width and rest half width on screen at a window size, from the scene's own maths. */
  function propAt(
    id: (typeof SCENE_OBJECTS)[number],
    stage: 'quotes' | 'hire',
    width: number,
    height: number,
  ) {
    const perUnit = height / WORLD_HEIGHT
    const fit = fitFor(false, width / height)
    const half = (withFocus: boolean) => {
      const pose = poseFor(id, stage, false, height, withFocus)
      const near = CAMERA_Z / (CAMERA_Z - pose.z)
      return PROP_REACH[id].halfWidth * perUnit * near * pose.s * fit
    }
    const pose = poseFor(id, stage, false, height)
    const near = CAMERA_Z / (CAMERA_Z - pose.z)
    return placeProp({
      xPx: pose.x * width * near,
      halfPx: half(true),
      restHalfPx: half(false),
      viewportPx: width,
      heightPx: height,
      placement: 'strip',
    })
  }

  it('holds the whole prop between the phone and the rail on a 1366 laptop', () => {
    const { from, to } = phoneStripPx(1366, 768)
    for (const id of SCENE_OBJECTS) {
      const perUnit = 768 / WORLD_HEIGHT
      const pose = poseFor(id, 'quotes', false, 768)
      const near = CAMERA_Z / (CAMERA_Z - pose.z)
      const half = PROP_REACH[id].halfWidth * perUnit * near * pose.s
      const { x, fit } = propAt(id, 'quotes', 1366, 768)
      expect(x - half * fit, `${id} left`).toBeGreaterThanOrEqual(from - 1e-6)
      expect(x + half * fit, `${id} right`).toBeLessThanOrEqual(to + 1e-6)
      expect(fit).toBeGreaterThan(PROP_MIN_FIT)
    }
  })

  it('scales a prop that is wider than the strip down to the strip, not off it', () => {
    const { from, to } = phoneStripPx(1366, 900)
    const { fit } = propAt('toolbox', 'quotes', 1366, 900)
    expect(fit).toBeLessThan(1)
    // The toolbox's width times its fit is the strip's width.
    const perUnit = 900 / WORLD_HEIGHT
    const pose = poseFor('toolbox', 'quotes', false, 900)
    const near = CAMERA_Z / (CAMERA_Z - pose.z)
    const aspectFit = fitFor(false, 1366 / 900)
    const width =
      2 * PROP_REACH.toolbox.halfWidth * perUnit * near * pose.s * aspectFit
    expect(width * fit).toBeCloseTo(to - from, 6)
  })

  it("does not park the step's own prop for being brought forward", () => {
    // The step's prop grows; sized by that it would be too wide for the strip
    // and vanish on its own step. It is sized by its rest size.
    for (const [id, stage] of [
      ['toolbox', 'hire'],
      ['boxes', 'quotes'],
    ] as const) {
      const { x, fit } = propAt(id, stage, 1366, 768)
      expect(x, `${id} ${stage}`).toBeLessThan(1366 / 2)
      expect(fit).toBeGreaterThan(0)
    }
  })

  it('waits off the right edge where the strip cannot hold a prop that reads (1024 to 1279px)', () => {
    for (const [width, height] of [
      [1024, 768],
      [1100, 800],
      [1279, 800],
    ] as const) {
      for (const id of SCENE_OBJECTS) {
        const { x } = propAt(id, 'quotes', width, height)
        // Its left edge is at or past the screen's right edge: none of it is seen.
        const perUnit = height / WORLD_HEIGHT
        const fit = fitFor(false, width / height)
        const pose = poseFor(id, 'quotes', false, height)
        const near = CAMERA_Z / (CAMERA_Z - pose.z)
        const half = PROP_REACH[id].halfWidth * perUnit * near * pose.s * fit
        expect(x - half, `${id} at ${width}`).toBeGreaterThanOrEqual(
          width / 2 - 1e-6,
        )
      }
    }
  })

  it('puts a prop whole in the margin outside the rail where that is the wider place (a wide monitor)', () => {
    for (const [width, height] of [
      [1920, 1080],
      [2560, 1440],
    ] as const) {
      const margin = railMarginStripPx(width)
      expect(margin.to - margin.from).toBeGreaterThan(
        phoneStripPx(width, height).to - phoneStripPx(width, height).from,
      )
      for (const id of SCENE_OBJECTS) {
        const { x, fit } = propAt(id, 'quotes', width, height)
        const perUnit = height / WORLD_HEIGHT
        const pose = poseFor(id, 'quotes', false, height)
        const near = CAMERA_Z / (CAMERA_Z - pose.z)
        const half = PROP_REACH[id].halfWidth * perUnit * near * pose.s
        expect(fit, `${id} at ${width}`).toBe(1)
        expect(x - half, `${id} at ${width}`).toBeGreaterThanOrEqual(
          PAGE_COLUMN_PX / 2,
        )
        expect(x + half, `${id} at ${width}`).toBeLessThanOrEqual(width / 2)
      }
    }
  })

  it('never lets a rail cross a prop in the strip, at any width', () => {
    for (const width of [1280, 1366, 1440, 1536, 1600, 1680, 1920, 2560]) {
      const height = Math.round(width / 1.78)
      for (const id of SCENE_OBJECTS) {
        const { x, fit } = propAt(id, 'quotes', width, height)
        const perUnit = height / WORLD_HEIGHT
        const aspectFit = fitFor(false, width / height)
        const pose = poseFor(id, 'quotes', false, height)
        const near = CAMERA_Z / (CAMERA_Z - pose.z)
        const half =
          PROP_REACH[id].halfWidth * perUnit * near * pose.s * aspectFit * fit
        const rail = PAGE_COLUMN_PX / 2
        const crosses = x - half < rail && x + half > rail
        expect(crosses, `${id} at ${width}`).toBe(false)
      }
    }
  })
})

describe('sceneStage', () => {
  it('holds the hero formation only while the hero is on screen', () => {
    expect(sceneStage('hero', true)).toBe('hero')
    expect(sceneStage('hero', false)).toBe(PARKED_STAGE)
  })

  it('leaves every other stage alone, hero in view or not', () => {
    for (const stage of STORY_STAGES.filter((stage) => stage !== 'hero')) {
      expect(sceneStage(stage, true)).toBe(stage)
      expect(sceneStage(stage, false)).toBe(stage)
    }
  })

  it('parks the props off the screen edges, where the opaque panels park them', () => {
    // The map panel and the bento are opaque: with the hero gone, the hero's
    // props waited in the middle of the screen and their shadows and a box's
    // underside showed in the transparent strip under the bento.
    expect(placementFor(PARKED_STAGE, false)).toBe('parked')
    expect(placementFor(PARKED_STAGE, true)).toBe('parked')
    for (const compact of [false, true]) {
      for (const id of compact ? COMPACT_OBJECTS : SCENE_OBJECTS) {
        expect(Math.abs(poseFor(id, PARKED_STAGE, compact).x)).toBeGreaterThan(
          0.5,
        )
      }
    }
  })
})

describe('closeFitPx', () => {
  const at = (
    compact: boolean,
    widthPx: number,
    heightPx: number,
    footerTopPx: number | null,
  ) =>
    closeFitPx({
      ids: compact ? COMPACT_OBJECTS : SCENE_OBJECTS,
      compact,
      widthPx,
      heightPx,
      footerTopPx,
      headerPx: 64,
    })

  /** Each prop's bottom (shadow included) and top on screen after the fit, in px from the top. */
  function extents(
    compact: boolean,
    widthPx: number,
    heightPx: number,
    lift: number,
    scale = 1,
  ) {
    const perUnit = heightPx / WORLD_HEIGHT
    const fit = fitFor(compact, widthPx / heightPx)
    return (compact ? COMPACT_OBJECTS : SCENE_OBJECTS).map((id) => {
      const pose = poseFor(id, 'cta', compact, heightPx)
      const near = CAMERA_Z / (CAMERA_Z - pose.z)
      const px = perUnit * near * pose.s * fit * scale
      const centre = heightPx / 2 - pose.y * heightPx * near - lift
      return {
        id,
        top: centre - PROP_REACH[id].above * px,
        bottom: centre + PROP_REACH[id].below * px,
      }
    })
  }

  /** Whether the fit keeps every prop between the header and the footer. */
  function clears(
    compact: boolean,
    widthPx: number,
    heightPx: number,
    footerTop: number,
  ) {
    const fit = at(compact, widthPx, heightPx, footerTop)
    if (fit.parked) return { fit, ok: true }
    const ok = extents(compact, widthPx, heightPx, fit.lift, fit.scale).every(
      ({ top, bottom }) =>
        top >= 64 + HEADER_MARGIN_PX - 1e-6 &&
        bottom <= footerTop - FOOTER_MARGIN_PX + 1e-6,
    )
    return { fit, ok }
  }

  it('does not touch the props while no footer is on screen', () => {
    expect(at(false, 1366, 900, null)).toEqual({
      lift: 0,
      scale: 1,
      parked: false,
    })
  })

  it('does not lift props that are already clear of the footer', () => {
    expect(at(false, 1366, 900, 5000).lift).toBe(0)
    expect(at(true, 390, 844, 5000).lift).toBe(0)
    expect(at(false, 1366, 900, 5000).scale).toBe(1)
  })

  it('lifts the close off the footer on a laptop screen, shadows and all', () => {
    // The review's case: 1366 x 900, the footer's top edge at y = 434.
    const { lift, scale, parked } = at(false, 1366, 900, 434)
    expect(lift).toBeGreaterThan(0)
    expect(scale).toBe(1)
    expect(parked).toBe(false)
    for (const { id, bottom } of extents(false, 1366, 900, lift)) {
      expect(bottom, id).toBeLessThanOrEqual(434 - FOOTER_MARGIN_PX + 1e-6)
    }
  })

  it('fits the close between the header and the footer on a laptop screen', () => {
    // The footer is about 466px tall, so at the end of the page its top edge is
    // that far up from the screen's foot. 900px tall leaves room for the whole
    // formation: nothing under the header, nothing under the footer.
    for (const width of [1366, 1440, 1536]) {
      const footerTop = 900 - 466
      const { fit, ok } = clears(false, width, 900, footerTop)
      expect(ok, `${width}`).toBe(true)
      expect(fit.scale, `${width}`).toBe(1)
      expect(fit.parked, `${width}`).toBe(false)
    }
  })

  it('cuts no prop on the common laptop heights, 650 to 780px, where it did before', () => {
    // The review's cases: 1536 x 730 cut the pin by the footer's edge, 1366 x
    // 657 sliced the boxes, 1280 x 600 left an empty strip. At the end of the
    // page the room between the header and the footer is smaller than the props
    // there, so lifting is not enough: they are scaled to fit, or parked.
    for (const [width, height] of [
      [1536, 730],
      [1366, 657],
      [1366, 768],
      [1440, 780],
      [1280, 650],
      [1280, 600],
      [1920, 700],
    ] as const) {
      const { fit, ok } = clears(false, width, height, height - 466)
      expect(ok, `${width} x ${height}`).toBe(true)
      expect(fit.scale, `${width} x ${height}`).toBeLessThanOrEqual(1)
    }
  })

  it('shrinks the props together to fit a room smaller than they are, and keeps their shape', () => {
    // 1366 x 768: the footer's top is at 302, the room 206px.
    const { lift, scale, parked } = at(false, 1366, 768, 768 - 466)
    expect(parked).toBe(false)
    expect(scale).toBeLessThan(1)
    expect(scale).toBeGreaterThanOrEqual(CLOSE_MIN_FIT)
    // One scale and one lift for the whole close: the pin stays under the boxes.
    const before = extents(false, 1366, 768, 0, scale)
    const after = extents(false, 1366, 768, lift, scale)
    for (const [index, { id }] of before.entries()) {
      expect(after[index].bottom - before[index].bottom, id).toBeCloseTo(
        -lift,
        9,
      )
    }
  })

  it('parks the props off the edges where even half size would not fit', () => {
    // Under CLOSE_MIN_FIT of their size they would be toys: they wait instead.
    for (const [width, height] of [
      [1366, 657],
      [1280, 600],
    ] as const) {
      const { parked } = at(false, width, height, height - 466)
      expect(parked, `${width} x ${height}`).toBe(true)
    }
  })

  it('never lifts a prop up under the header, whatever the footer does', () => {
    // A footer so high there is no room: nothing is left cut, the props wait.
    const { fit, ok } = clears(false, 1366, 900, 120)
    expect(ok).toBe(true)
    expect(fit.parked).toBe(true)
  })

  it('shrinks as the footer comes up the screen, never jumping', () => {
    // As the visitor scrolls to the end the footer's top edge rises: the scale
    // only ever falls, and the lift only ever rises until the props are parked.
    let last = Number.POSITIVE_INFINITY
    for (let footerTop = 900; footerTop >= 150; footerTop -= 10) {
      const { scale, parked } = at(false, 1366, 800, footerTop)
      if (parked) break
      expect(scale).toBeLessThanOrEqual(last + 1e-9)
      last = scale
    }
  })

  it('holds on a phone and a tablet too', () => {
    for (const [width, height, footerTop] of [
      [390, 844, 300],
      [768, 1024, 270],
    ] as const) {
      const { fit, ok } = clears(true, width, height, footerTop)
      expect(ok, `${width}`).toBe(true)
      expect(fit.scale, `${width}`).toBeLessThanOrEqual(1)
    }
  })
})

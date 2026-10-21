import { describe, expect, it } from 'vitest'

import {
  MAX_ZOOM,
  MIN_ZOOM,
  REST_VIEW,
  clampView,
  pinchView,
  zoomViewAt,
} from './zoomPan'

const stage = { width: 1000, height: 800 }
const landscape = { width: 1000, height: 500 }

describe('clampView', () => {
  it('keeps the scale between 1x and 4x', () => {
    expect(clampView({ scale: 0.5, x: 0, y: 0 }, landscape, stage).scale).toBe(
      MIN_ZOOM,
    )
    expect(clampView({ scale: 9, x: 0, y: 0 }, landscape, stage).scale).toBe(
      MAX_ZOOM,
    )
  })

  it('centres a fitted photo however far it was dragged', () => {
    const view = clampView({ scale: 1, x: 300, y: -200 }, landscape, stage)
    expect(Math.abs(view.x)).toBe(0)
    expect(Math.abs(view.y)).toBe(0)
  })

  it('pans a zoomed photo only until its edge meets the stage edge', () => {
    // At 2x the photo is 2000 x 1000: 500px spare each side, 100px top and bottom.
    expect(clampView({ scale: 2, x: 900, y: -900 }, landscape, stage)).toEqual({
      scale: 2,
      x: 500,
      y: -100,
    })
    expect(clampView({ scale: 2, x: -120, y: 40 }, landscape, stage)).toEqual({
      scale: 2,
      x: -120,
      y: 40,
    })
  })

  it('keeps a side still smaller than the stage centred', () => {
    // At 1.5x the photo is 1500 x 750: it pans across but not up or down.
    const view = clampView({ scale: 1.5, x: 400, y: 60 }, landscape, stage)
    expect(view.x).toBe(250)
    expect(Math.abs(view.y)).toBe(0)
  })
})

describe('zoomViewAt', () => {
  it('zooms around the centre without moving the photo', () => {
    expect(zoomViewAt(REST_VIEW, 2, { x: 0, y: 0 })).toEqual({
      scale: 2,
      x: 0,
      y: 0,
    })
  })

  it('keeps the point under the pointer still', () => {
    const point = { x: 200, y: -100 }
    const view = zoomViewAt(REST_VIEW, 2, point)
    // The photo pixel under `point` at 1x is `point` itself; at 2x it lands
    // at offset + 2 * point, which must still be `point`.
    expect(view.x + 2 * point.x).toBeCloseTo(point.x)
    expect(view.y + 2 * point.y).toBeCloseTo(point.y)
  })

  it('stops at the zoom limits', () => {
    expect(zoomViewAt(REST_VIEW, 10, { x: 0, y: 0 }).scale).toBe(MAX_ZOOM)
    expect(zoomViewAt({ scale: 2, x: 0, y: 0 }, 0.2, { x: 0, y: 0 })).toEqual(
      REST_VIEW,
    )
  })
})

describe('pinchView', () => {
  it('zooms by how far the fingers spread', () => {
    const view = pinchView(
      REST_VIEW,
      [
        { x: -50, y: 0 },
        { x: 50, y: 0 },
      ],
      [
        { x: -100, y: 0 },
        { x: 100, y: 0 },
      ],
    )
    expect(view).toEqual({ scale: 2, x: 0, y: 0 })
  })

  it('follows the fingers as they move together', () => {
    const view = pinchView(
      { scale: 2, x: 0, y: 0 },
      [
        { x: -50, y: 0 },
        { x: 50, y: 0 },
      ],
      [
        { x: -30, y: 40 },
        { x: 70, y: 40 },
      ],
    )
    expect(view).toEqual({ scale: 2, x: 20, y: 40 })
  })
})

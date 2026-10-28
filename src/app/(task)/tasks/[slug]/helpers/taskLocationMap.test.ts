import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { TaskStatus } from '@codegen/schema'
import { offsetPaddingForMobile } from '../../../helpers/marketplaceMap/offset/offset'

import type { TaskDetailRecord } from './taskDetailUtils'
import {
  buildTaskDetailMapPinTask,
  parseTaskDetailSearchRouteOrigin,
} from './taskLocationMap'

const dir = dirname(fileURLToPath(import.meta.url))

describe('task detail Mapbox chrome', () => {
  it('drives the shared marketplace map instead of a second Mapbox instance', () => {
    const binder = readFileSync(
      join(dir, '../components/layout/TaskDetailMapBinder.tsx'),
      'utf8',
    )
    const view = readFileSync(
      join(dir, '../components/layout/TaskDetailView.tsx'),
      'utf8',
    )
    const host = readFileSync(
      join(dir, '../../../context/MarketplaceMapSession.tsx'),
      'utf8',
    )
    expect(view).toContain('TaskDetailMapBinder')
    expect(view).not.toContain('TaskDetailMapBackground')
    expect(binder).toContain('shouldKeepBrowseMarketplaceMap')
    expect(binder).toContain('taskDetailSearchRouteOriginFromLocationSearch')
    expect(binder).toContain('buildTaskDetailMapPinTask')
    // The layer follows what the viewer may see (FE-472): the pin for the
    // exact viewers, the circle with no pin for everyone else.
    expect(binder).toContain("variant: 'exact'")
    expect(binder).toContain("variant: 'approximate'")
    expect(binder).toContain('selectedTaskId: task.id')
    expect(binder).toContain('locationAccess')
    expect(binder).toContain('usePublishTaskLocationAccess')
    expect(binder).not.toContain('taskDetailShowsExactLocation')
    expect(binder).toContain('origin')
    expect(binder).toContain('showReferenceMarker')
    expect(binder).not.toContain('routeFromViewer')
    expect(host).toContain('top={0}')
    expect(host).toContain('position="fixed"')
    expect(host).toContain("cameraMode === 'detail'")
    expect(host).toContain('heldPropsRef')
    expect(host).toContain('framingTaskId')
    expect(binder).toContain('keepBrowse')
  })

  it('gives an approximate viewer no pin, no route, no You marker, and no search origin', () => {
    const binder = readFileSync(
      join(dir, '../components/layout/TaskDetailMapBinder.tsx'),
      'utf8',
    )
    const start = binder.indexOf("if (locationAccess === 'approximate') {")
    const end = binder.indexOf('const origin', start)
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    const approximate = binder.slice(start, end)
    expect(approximate).toContain("variant: 'approximate'")
    expect(approximate).toContain('tasks: []')
    expect(approximate).toContain('selectedTaskId: null')
    expect(approximate).toContain('showReferenceMarker: false')
    expect(approximate).toContain('navRouteEnabled: false')
    // Centred on `location`: never the search origin, the order or a pin.
    expect(approximate).toContain('centerLat: lat')
    expect(approximate).not.toContain('origin')
    expect(approximate).not.toContain('myOrder')
    expect(approximate).not.toContain('buildTaskDetailMapPinTask')
    // Nothing is published before the viewer is known.
    expect(binder).toContain("if (locationAccess === 'pending') return null")
  })

  it('takes the order snapshot only inside the exact branch', () => {
    const binder = readFileSync(
      join(dir, '../components/layout/TaskDetailMapBinder.tsx'),
      'utf8',
    )
    expect(binder).toContain("locationAccess === 'exact'")
    expect(binder).toMatch(
      /taskDetailMapCoordinates\(\s*task,\s*myOrder,\s*locationAccess === 'exact'/,
    )
  })

  it('keeps the camera on the task pin and only routes from a search-page origin', () => {
    const controllerSrc = readFileSync(join(dir, 'taskLocationMap.ts'), 'utf8')
    expect(controllerSrc).toContain('jumpTo')
    expect(controllerSrc).not.toContain('m.fitBounds')
    expect(controllerSrc).not.toContain('getCurrentPosition')
    expect(controllerSrc).toContain('routeOrigin')
    expect(controllerSrc).toContain('referenceMarkerElement')
    expect(controllerSrc).not.toContain('mobileTaskDetailMapPadding')
  })
})

describe('parseTaskDetailSearchRouteOrigin', () => {
  it('returns the search-page center only when from=search with valid coords', () => {
    expect(
      parseTaskDetailSearchRouteOrigin({
        from: 'search',
        lat: '51.50740',
        lng: '-0.12780',
      }),
    ).toEqual({ lat: 51.5074, lng: -0.1278 })
  })

  it('ignores a direct task-detail load and invalid coordinates', () => {
    expect(
      parseTaskDetailSearchRouteOrigin({
        from: null,
        lat: '51.5',
        lng: '-0.1',
      }),
    ).toBeNull()
    expect(
      parseTaskDetailSearchRouteOrigin({
        from: 'search',
        lat: '91',
        lng: '0',
      }),
    ).toBeNull()
    expect(
      parseTaskDetailSearchRouteOrigin({
        from: 'search',
        lat: 'x',
        lng: 'y',
      }),
    ).toBeNull()
  })
})

describe('buildTaskDetailMapPinTask', () => {
  const task = {
    id: 'task-1',
    title: 'Cleaner needed',
    status: TaskStatus.Open,
    quotes: [],
    budget: { amount: 100, currency: 'GBP' },
  } as unknown as TaskDetailRecord

  it('uses the search-page origin for the same miles-away label as browse', () => {
    const pin = buildTaskDetailMapPinTask(
      task,
      { lat: 51.5085, lng: -0.1278 },
      'visitor',
      null,
      { lat: 51.5074, lng: -0.1278 },
    )
    expect(pin.distanceLabel).toMatch(/miles away$/)
    expect(pin.priceLabel).toBe('£100')
  })

  it('omits miles when there is no search origin', () => {
    const pin = buildTaskDetailMapPinTask(
      task,
      { lat: 51.5074, lng: -0.1278 },
      'visitor',
    )
    expect(pin.distanceLabel).toBeUndefined()
  })
})

describe('offsetPaddingForMobile', () => {
  it('pins the task in the upper hero band', () => {
    const padding = offsetPaddingForMobile(390, 800)
    expect(padding.top).toBe(48)
    expect(padding.bottom).toBeGreaterThan(400)
  })
})

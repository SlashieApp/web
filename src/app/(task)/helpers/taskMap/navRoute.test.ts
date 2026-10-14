import { describe, expect, it, vi } from 'vitest'

import {
  TASK_MAP_NAV_ROUTE_SOURCE,
  createTaskMapNavRouteController,
} from './navRoute'

function fakeMap() {
  const setData = vi.fn()
  const map = {
    styleLoaded: true,
    isStyleLoaded() {
      return this.styleLoaded
    },
    getSource: (id: string) =>
      id === TASK_MAP_NAV_ROUTE_SOURCE ? { setData } : undefined,
    getLayer: () => undefined,
    setPaintProperty: vi.fn(),
  }
  return { map, setData }
}

function controllerFor(map: ReturnType<typeof fakeMap>['map']) {
  return createTaskMapNavRouteController({
    getMap: () => map as never,
    getAccessToken: () => 'pk.test',
    getSearchCenter: () => ({ lat: 51.5, lng: -0.12 }),
  })
}

describe('nav route clear', () => {
  it('clears the line straight away when the style is ready', () => {
    const { map, setData } = fakeMap()
    controllerFor(map).clearRoute()
    expect(setData).toHaveBeenCalledTimes(1)
  })

  it('defers the clear to the next idle while tiles load (FE-266)', () => {
    const { map, setData } = fakeMap()
    const route = controllerFor(map)
    map.styleLoaded = false
    route.clearRoute()
    expect(setData).not.toHaveBeenCalled()

    map.styleLoaded = true
    route.flushWhenReady()
    expect(setData).toHaveBeenCalledTimes(1)
    route.flushWhenReady()
    expect(setData).toHaveBeenCalledTimes(1)
  })
})

import { describe, expect, it } from 'vitest'

import type { TaskMapProps } from '../../components/ui/TaskMap'

import { WEB_MIN_PX } from '@/theme/breakpoints'
import {
  type MarketplaceMapPublishedLayer,
  type TaskLocationMapAccess,
  confirmedTaskLocationAccess,
  publishedMarketplaceLayerSig,
  resolveMarketplaceMapLayer,
  shouldKeepBrowseMarketplaceMap,
} from './layer'

import { marketplaceMapIsDesktopWidth } from './viewport'

const browseTask = {
  id: 'task-1',
  title: 'Assemble wardrobe',
  locationLat: 51.5,
  locationLng: -0.12,
}

const otherTask = {
  id: 'task-2',
  title: 'Walk the dog',
  locationLat: 51.51,
  locationLng: -0.13,
}

const browseProps: TaskMapProps = {
  accessToken: 'pk.test',
  centerLat: 51.5,
  centerLng: -0.1,
  radiusMiles: 10,
  tasks: [browseTask, otherTask],
  selectedTaskId: null,
}

const browseLayer: MarketplaceMapPublishedLayer = {
  source: 'browse',
  cameraMode: 'browse',
  variant: 'exact',
  props: browseProps,
}

describe('resolveMarketplaceMapLayer', () => {
  it('keeps every pin while browsing', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: browseLayer,
      focusTaskId: null,
    })
    expect(resolved?.tasks).toHaveLength(2)
    expect(resolved?.cameraMode).toBe('browse')
    expect(resolved?.taskPinMode).toBe('all')
    expect(resolved?.mapInteractions).toBe(true)
  })

  it('clears browse selection so the host can collapse the pin', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: {
        ...browseLayer,
        props: { ...browseProps, selectedTaskId: null },
      },
      focusTaskId: null,
    })
    expect(resolved?.selectedTaskId).toBeNull()
    expect(resolved?.cameraMode).toBe('browse')
    expect(resolved?.taskPinMode).toBe('all')
  })

  it('keeps browse pin framing when a search task is selected', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: {
        ...browseLayer,
        props: { ...browseProps, selectedTaskId: 'task-1' },
      },
      focusTaskId: null,
    })
    expect(resolved?.selectedTaskId).toBe('task-1')
    expect(resolved?.cameraMode).toBe('browse')
    expect(resolved?.taskPinMode).toBe('all')
    expect(resolved?.viewPadding).toBeUndefined()
    expect(resolved?.mapInteractions).toBe(true)
  })

  it('keeps every browse pin and flies the detail camera when a search task is opened', () => {
    const padding = { top: 58, left: 700, right: 20, bottom: 400 }
    const resolved = resolveMarketplaceMapLayer({
      published: browseLayer,
      focusTaskId: 'task-1',
      viewPadding: padding,
      viewport: 'web',
    })
    expect(resolved?.tasks.map((task) => task.id)).toEqual(['task-1', 'task-2'])
    expect(resolved?.selectedTaskId).toBe('task-1')
    expect(resolved?.cameraMode).toBe('detail')
    expect(resolved?.taskPinMode).toBe('all')
    expect(resolved?.viewPadding).toEqual(padding)
    expect(resolved?.mapInteractions).toBe(false)
    expect(resolved?.leftViewportPadding).toBe(0)
  })

  it('drops the search logo / bar space for map controls on task detail (FE-208)', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: {
        ...browseLayer,
        props: {
          ...browseProps,
          compactCtrlTopOffset: '50px',
          touchCtrlTopOffset: '134px',
        },
      },
      focusTaskId: 'task-1',
      viewport: 'mobile',
    })
    expect(resolved?.compactCtrlTopOffset).toBeUndefined()
    expect(resolved?.touchCtrlTopOffset).toBeUndefined()
  })

  it('does not solo the browse layer on a search→detail handoff', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: browseLayer,
      focusTaskId: 'task-1',
      viewport: 'mobile',
    })
    expect(resolved?.cameraMode).toBe('detail')
    expect(resolved?.taskPinMode).toBe('all')
    expect(resolved?.selectedTaskId).toBe('task-1')
    expect(resolved?.tasks).toHaveLength(2)
  })

  it('hides price pins for an approximate detail layer (zone only)', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: {
        source: 'detail',
        cameraMode: 'detail',
        variant: 'approximate',
        props: {
          ...browseProps,
          tasks: [browseTask],
          selectedTaskId: 'task-1',
        },
      },
      focusTaskId: null,
    })
    expect(resolved?.taskPinMode).toBe('none')
    expect(resolved?.cameraMode).toBe('detail')
  })
})

const APPROX_LABEL = 'Approximate area. Exact address after booking.'

const approxAccess: TaskLocationMapAccess = {
  taskId: 'task-1',
  access: 'approximate',
  center: { lat: 51.5081, lng: -0.1269 },
  approxLabel: APPROX_LABEL,
}

const exactAccess: TaskLocationMapAccess = {
  ...approxAccess,
  access: 'exact',
}

const detailLayer = (
  variant: 'exact' | 'approximate',
  overrides: Partial<TaskMapProps> = {},
): MarketplaceMapPublishedLayer => ({
  source: 'detail',
  cameraMode: 'detail',
  variant,
  props: {
    ...browseProps,
    tasks: variant === 'exact' ? [browseTask] : [],
    selectedTaskId: variant === 'exact' ? 'task-1' : null,
    navRouteEnabled: variant === 'exact',
    showReferenceMarker: variant === 'exact',
    ...overrides,
  },
})

describe('resolveMarketplaceMapLayer, default deny on task detail (FE-472)', () => {
  const onDetail = {
    focusTaskId: 'task-1',
    viewport: 'mobile' as const,
    onDetailPath: true,
    approxZoom: 12.57,
  }

  const draws = (resolved: TaskMapProps | null) => ({
    pins: resolved?.tasks.length ?? 0,
    pinMode: resolved?.taskPinMode,
    selected: resolved?.selectedTaskId,
    route: resolved?.navRouteEnabled,
    you: resolved?.showReferenceMarker,
    zone: resolved?.approxZone ?? null,
  })

  it('draws no pin, no other pins, no route and no You marker until the viewer is known', () => {
    const resolved = resolveMarketplaceMapLayer({
      ...onDetail,
      published: browseLayer,
      locationAccess: null,
    })
    expect(draws(resolved)).toEqual({
      pins: 0,
      pinMode: 'none',
      selected: null,
      route: false,
      you: false,
      zone: null,
    })
    expect(resolved?.cameraMode).toBe('detail')
  })

  it('treats a pending viewer the same: nothing, and no circle', () => {
    const resolved = resolveMarketplaceMapLayer({
      ...onDetail,
      published: browseLayer,
      locationAccess: { ...approxAccess, access: 'pending' },
    })
    expect(draws(resolved).pins).toBe(0)
    expect(draws(resolved).zone).toBeNull()
  })

  it('never lets a confirmation for another task unlock this one', () => {
    for (const published of [browseLayer, detailLayer('exact')]) {
      const resolved = resolveMarketplaceMapLayer({
        ...onDetail,
        published,
        locationAccess: { ...exactAccess, taskId: 'task-9' },
      })
      expect(draws(resolved).pins).toBe(0)
      expect(draws(resolved).route).toBe(false)
      expect(draws(resolved).you).toBe(false)
    }
  })

  it('opened from /search, an approximate viewer gets the circle and nothing else', () => {
    const resolved = resolveMarketplaceMapLayer({
      ...onDetail,
      published: browseLayer,
      locationAccess: approxAccess,
    })
    expect(draws(resolved)).toEqual({
      pins: 0,
      pinMode: 'none',
      selected: null,
      route: false,
      you: false,
      zone: {
        taskId: 'task-1',
        lat: 51.5081,
        lng: -0.1269,
        radiusM: 400,
        zoom: 12.57,
      },
    })
    expect(resolved?.mapAriaLabel).toBe(APPROX_LABEL)
    expect(resolved?.mapInteractions).toBe(false)
  })

  it('centres the circle on the location the binder confirmed, never on a browse pin', () => {
    const resolved = resolveMarketplaceMapLayer({
      ...onDetail,
      published: browseLayer,
      locationAccess: approxAccess,
    })
    expect(resolved?.approxZone?.lat).not.toBe(browseTask.locationLat)
    expect(resolved?.approxZone?.lat).toBe(approxAccess.center?.lat)
  })

  it('draws no circle without a centre or a window to fit it in', () => {
    expect(
      resolveMarketplaceMapLayer({
        ...onDetail,
        published: browseLayer,
        locationAccess: { ...approxAccess, center: null },
      })?.approxZone,
    ).toBeNull()
    expect(
      resolveMarketplaceMapLayer({
        ...onDetail,
        approxZoom: undefined,
        published: browseLayer,
        locationAccess: approxAccess,
      })?.approxZone,
    ).toBeNull()
  })

  it('an approximate cold load (a detail layer) is the circle with no pin', () => {
    const resolved = resolveMarketplaceMapLayer({
      ...onDetail,
      focusTaskId: 'task-1',
      published: detailLayer('approximate'),
      locationAccess: approxAccess,
    })
    expect(draws(resolved)).toMatchObject({
      pins: 0,
      pinMode: 'none',
      route: false,
      you: false,
    })
    expect(resolved?.approxZone?.taskId).toBe('task-1')
  })

  it('never draws a browse pin for an exact viewer: they get the binder’s detail layer', () => {
    const resolved = resolveMarketplaceMapLayer({
      ...onDetail,
      published: browseLayer,
      locationAccess: exactAccess,
    })
    expect(draws(resolved).pins).toBe(0)
    expect(draws(resolved).zone).toBeNull()
  })

  it('draws an exact viewer’s solo pin as it always did, route and You marker included', () => {
    const resolved = resolveMarketplaceMapLayer({
      ...onDetail,
      published: detailLayer('exact'),
      locationAccess: exactAccess,
    })
    expect(draws(resolved)).toEqual({
      pins: 1,
      pinMode: 'solo',
      selected: 'task-1',
      route: true,
      you: true,
      zone: null,
    })
    expect(resolved?.approxZone).toBeUndefined()
  })

  it('leaves /search and a bare focus alone: only the detail path denies', () => {
    for (const onDetailPath of [false, undefined]) {
      const resolved = resolveMarketplaceMapLayer({
        published: browseLayer,
        focusTaskId: 'task-1',
        viewport: 'mobile',
        onDetailPath,
        locationAccess: null,
      })
      expect(resolved?.tasks).toHaveLength(2)
      expect(resolved?.taskPinMode).toBe('all')
      expect(resolved?.approxZone).toBeUndefined()
    }
  })

  it('draws a leftover task confirmation on /search as nothing', () => {
    const resolved = resolveMarketplaceMapLayer({
      published: browseLayer,
      focusTaskId: null,
      viewport: 'web',
      onDetailPath: false,
      locationAccess: approxAccess,
    })
    expect(resolved?.tasks).toHaveLength(2)
    expect(resolved?.approxZone).toBeUndefined()
    expect(resolved?.taskPinMode).toBe('all')
  })

  it('keeps the exact and approximate detail layers apart in the publish signature', () => {
    expect(publishedMarketplaceLayerSig(detailLayer('exact'))).not.toBe(
      publishedMarketplaceLayerSig(detailLayer('approximate')),
    )
  })
})

describe('confirmedTaskLocationAccess', () => {
  it('confirms only on the detail path and only for the framed task', () => {
    const base = {
      onDetailPath: true,
      framingTaskId: 'task-1',
      locationAccess: exactAccess,
    }
    expect(confirmedTaskLocationAccess(base)).toBe(exactAccess)
    expect(
      confirmedTaskLocationAccess({ ...base, onDetailPath: false }),
    ).toBeNull()
    expect(
      confirmedTaskLocationAccess({ ...base, framingTaskId: 'task-2' }),
    ).toBeNull()
    expect(
      confirmedTaskLocationAccess({ ...base, framingTaskId: null }),
    ).toBeNull()
    expect(
      confirmedTaskLocationAccess({ ...base, locationAccess: null }),
    ).toBeNull()
  })
})

describe('shouldKeepBrowseMarketplaceMap', () => {
  it('keeps the search canvas when opening a task from /search', () => {
    expect(
      shouldKeepBrowseMarketplaceMap({
        published: browseLayer,
        taskId: 'task-1',
        focusTaskId: null,
        fromSearch: true,
      }),
    ).toBe(true)
  })

  it('keeps the search canvas when prepareDetail targeted this task', () => {
    expect(
      shouldKeepBrowseMarketplaceMap({
        published: browseLayer,
        taskId: 'task-1',
        focusTaskId: 'task-1',
        fromSearch: false,
      }),
    ).toBe(true)
  })

  it('lets a cold task-detail load publish its own layer', () => {
    expect(
      shouldKeepBrowseMarketplaceMap({
        published: null,
        taskId: 'task-1',
        focusTaskId: null,
        fromSearch: true,
      }),
    ).toBe(false)
    expect(
      shouldKeepBrowseMarketplaceMap({
        published: browseLayer,
        taskId: 'task-9',
        focusTaskId: 'task-1',
        fromSearch: false,
      }),
    ).toBe(false)
  })
})

describe('marketplace map viewport', () => {
  it('uses desktop width at Chakra lg', () => {
    expect(marketplaceMapIsDesktopWidth(WEB_MIN_PX - 1)).toBe(false)
    expect(marketplaceMapIsDesktopWidth(WEB_MIN_PX)).toBe(true)
  })
})

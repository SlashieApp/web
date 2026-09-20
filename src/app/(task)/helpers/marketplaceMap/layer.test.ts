import { describe, expect, it } from 'vitest'

import type { TaskMapProps } from '../../components/ui/TaskMap'

import { WEB_MIN_PX } from '@/theme/breakpoints'
import {
  type MarketplaceMapPublishedLayer,
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

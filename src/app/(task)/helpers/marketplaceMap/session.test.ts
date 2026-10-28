import { describe, expect, it } from 'vitest'

import type { TaskMapProps } from '../../components/ui/TaskMap'
import type {
  MarketplaceMapPublishedLayer,
  TaskLocationMapAccess,
} from './layer'
import {
  APPROX_PILL_ONE_LINE_PX,
  approxCircleFrame,
} from './offset/approxFrame'
import {
  INITIAL_MARKETPLACE_MAP_STATE,
  type MarketplaceMapAction,
  type MarketplaceMapState,
  framingTaskIdFor,
  marketplaceMapReducer,
  resolveMarketplaceMapHost,
} from './session'

const LABEL = 'Approximate area. Exact address after booking.'

const taskT = {
  id: 'task-t',
  title: 'Assemble wardrobe',
  locationLat: 51.5,
  locationLng: -0.12,
}
const taskU = {
  id: 'task-u',
  title: 'Walk the dog',
  locationLat: 51.51,
  locationLng: -0.13,
}

const browseProps: TaskMapProps = {
  accessToken: 'pk.test',
  centerLat: 51.5,
  centerLng: -0.1,
  radiusMiles: 10,
  tasks: [taskT, taskU],
  selectedTaskId: null,
}

const browseLayer: MarketplaceMapPublishedLayer = {
  source: 'browse',
  cameraMode: 'browse',
  variant: 'exact',
  props: browseProps,
}

/** The binder's detail layer: the task's own exact pin, or no pin at all. */
const detailLayer = (
  task: typeof taskT,
  variant: 'exact' | 'approximate',
): MarketplaceMapPublishedLayer => ({
  source: 'detail',
  cameraMode: 'detail',
  variant,
  props: {
    ...browseProps,
    tasks: variant === 'exact' ? [task] : [],
    selectedTaskId: variant === 'exact' ? task.id : null,
    navRouteEnabled: variant === 'exact',
    showReferenceMarker: variant === 'exact',
  },
})

const access = (
  task: typeof taskT,
  kind: TaskLocationMapAccess['access'],
): TaskLocationMapAccess => ({
  taskId: task.id,
  access: kind,
  center: { lat: task.locationLat, lng: task.locationLng },
  approxLabel: LABEL,
})

function run(...actions: MarketplaceMapAction[]): MarketplaceMapState {
  return actions.reduce(marketplaceMapReducer, INITIAL_MARKETPLACE_MAP_STATE)
}

const WIDE = { w: 1366, h: 900 }
const PHONE = { w: 390, h: 844 }

/** What the host puts on screen, as its data attributes report it. */
function drawn(
  state: MarketplaceMapState,
  pathname: string,
  size = PHONE,
  topInset?: number,
) {
  const view = resolveMarketplaceMapHost({ state, pathname, size, topInset })
  const props = view.mapProps
  return {
    view,
    pins: props?.tasks.map((task) => task.id) ?? [],
    pinMode: props?.taskPinMode,
    selected: props?.selectedTaskId ?? null,
    route: props?.navRouteEnabled,
    you: props?.showReferenceMarker,
    zone: props?.approxZone ?? null,
  }
}

describe('marketplaceMapReducer', () => {
  it('keeps the same state for a layer or a pill height it already has', () => {
    const once = run({ type: 'publish', layer: browseLayer })
    expect(
      marketplaceMapReducer(once, {
        type: 'publish',
        layer: { ...browseLayer },
      }),
    ).toBe(once)
    const measured = run({ type: 'setApproxPillHeight', height: 46 })
    expect(
      marketplaceMapReducer(measured, {
        type: 'setApproxPillHeight',
        height: 46,
      }),
    ).toBe(measured)
    const confirmed = run({
      type: 'setTaskAccess',
      access: access(taskT, 'approximate'),
    })
    expect(
      marketplaceMapReducer(confirmed, {
        type: 'setTaskAccess',
        access: { ...access(taskT, 'approximate') },
      }),
    ).toBe(confirmed)
    expect(
      marketplaceMapReducer(INITIAL_MARKETPLACE_MAP_STATE, {
        type: 'clearFocus',
      }),
    ).toBe(INITIAL_MARKETPLACE_MAP_STATE)
  })

  it('takes a changed confirmation, such as the viewer becoming known', () => {
    const next = run(
      { type: 'setTaskAccess', access: access(taskT, 'pending') },
      { type: 'setTaskAccess', access: access(taskT, 'exact') },
    )
    expect(next.taskAccess?.access).toBe('exact')
  })

  it('prepareDetail keeps a confirmation for the same task and drops another one', () => {
    const confirmed = run({
      type: 'setTaskAccess',
      access: access(taskT, 'exact'),
    })
    expect(
      marketplaceMapReducer(confirmed, {
        type: 'prepareDetail',
        taskId: taskT.id,
      }).taskAccess?.taskId,
    ).toBe(taskT.id)
    const other = marketplaceMapReducer(confirmed, {
      type: 'prepareDetail',
      taskId: taskU.id,
    })
    expect(other.focusTaskId).toBe(taskU.id)
    expect(other.taskAccess).toBeNull()
  })

  it('prepareBrowse and clearFocus reset the focus and the confirmation', () => {
    const detail = run(
      { type: 'prepareDetail', taskId: taskT.id },
      { type: 'setTaskAccess', access: access(taskT, 'exact') },
    )
    const browse = marketplaceMapReducer(detail, { type: 'prepareBrowse' })
    expect(browse).toMatchObject({
      focusTaskId: null,
      taskAccess: null,
      overlayAhead: 'search',
    })
    const cleared = marketplaceMapReducer(detail, { type: 'clearFocus' })
    expect(cleared).toMatchObject({
      focusTaskId: null,
      taskAccess: null,
      overlayAhead: null,
    })
  })

  it('a browse layer ends the Search overlay in flight; a detail layer keeps it', () => {
    const ahead = run({ type: 'prepareBrowse' })
    expect(
      marketplaceMapReducer(ahead, { type: 'publish', layer: browseLayer })
        .overlayAhead,
    ).toBeNull()
    expect(
      marketplaceMapReducer(ahead, {
        type: 'publish',
        layer: detailLayer(taskT, 'exact'),
      }).overlayAhead,
    ).toBe('search')
  })
})

describe('framingTaskIdFor', () => {
  it('is the page’s own task on a task page, whatever the focus says', () => {
    expect(
      framingTaskIdFor({ pathname: '/tasks/task-u', focusTaskId: 'task-t' }),
    ).toBe('task-u')
    expect(
      framingTaskIdFor({
        pathname: '/zh-hk/tasks/task-u/preview',
        focusTaskId: 'task-t',
      }),
    ).toBe('task-u')
    expect(
      framingTaskIdFor({ pathname: '/tasks/task-t', focusTaskId: null }),
    ).toBe('task-t')
  })

  it('is the focus elsewhere: the handoff in flight from /search', () => {
    expect(
      framingTaskIdFor({ pathname: '/search', focusTaskId: 'task-t' }),
    ).toBe('task-t')
    expect(framingTaskIdFor({ pathname: '/search', focusTaskId: null })).toBe(
      null,
    )
    // Not a task page: edit and other nested routes.
    expect(
      framingTaskIdFor({ pathname: '/tasks/task-t/edit', focusTaskId: null }),
    ).toBe(null)
  })
})

describe('the host on a task page, through the state it keeps (FE-472)', () => {
  it('opened from Search, draws nothing for the task until the viewer is known', () => {
    const state = run(
      { type: 'publish', layer: browseLayer },
      { type: 'prepareDetail', taskId: taskT.id },
    )
    const d = drawn(state, '/tasks/task-t')
    expect(d.pins).toEqual([])
    expect(d.pinMode).toBe('none')
    expect(d.route).toBe(false)
    expect(d.you).toBe(false)
    expect(d.zone).toBeNull()
    expect(d.view.mapProps?.mapAriaLabel).toBe('')
    // The camera still goes to the task's window.
    expect(d.view.mapProps?.cameraMode).toBe('detail')
  })

  it('a signed-in viewer who is still pending gets no pin and no circle', () => {
    const state = run(
      { type: 'publish', layer: browseLayer },
      { type: 'prepareDetail', taskId: taskT.id },
      { type: 'setTaskAccess', access: access(taskT, 'pending') },
    )
    const d = drawn(state, '/tasks/task-t')
    expect(d.pins).toEqual([])
    expect(d.zone).toBeNull()
  })

  it('an approximate viewer gets the circle, centred on the task, and no pin', () => {
    const state = run(
      { type: 'publish', layer: browseLayer },
      { type: 'prepareDetail', taskId: taskT.id },
      { type: 'setTaskAccess', access: access(taskT, 'approximate') },
    )
    const d = drawn(state, '/tasks/task-t')
    expect(d.pins).toEqual([])
    expect(d.zone).toMatchObject({
      taskId: 'task-t',
      lat: taskT.locationLat,
      lng: taskT.locationLng,
      radiusM: 400,
    })
    expect(d.view.mapProps?.mapAriaLabel).toBe(LABEL)
    expect(d.view.approxFrame).not.toBeNull()
  })

  it('an exact viewer from Search gets the detail layer’s own pin, not the browse pins', () => {
    const base = run(
      { type: 'publish', layer: browseLayer },
      { type: 'prepareDetail', taskId: taskT.id },
      { type: 'setTaskAccess', access: access(taskT, 'exact') },
    )
    // The browse layer is still the published one: the other pins stay off.
    expect(drawn(base, '/tasks/task-t').pins).toEqual([])
    const withDetail = marketplaceMapReducer(base, {
      type: 'publish',
      layer: detailLayer(taskT, 'exact'),
    })
    const d = drawn(withDetail, '/tasks/task-t')
    expect(d.pins).toEqual(['task-t'])
    expect(d.pinMode).toBe('solo')
    expect(d.selected).toBe('task-t')
    expect(d.route).toBe(true)
    expect(d.zone).toBeNull()
  })

  it('Back to Search draws every pin again and no circle', () => {
    const onTask = run(
      { type: 'publish', layer: browseLayer },
      { type: 'prepareDetail', taskId: taskT.id },
      { type: 'setTaskAccess', access: access(taskT, 'approximate') },
    )
    const back = [
      { type: 'prepareBrowse' },
      { type: 'setTaskAccess', access: null },
    ].reduce(
      (state, action) =>
        marketplaceMapReducer(state, action as MarketplaceMapAction),
      onTask,
    )
    const d = drawn(back, '/search', WIDE)
    expect(d.pins).toEqual(['task-t', 'task-u'])
    expect(d.pinMode).toBe('all')
    expect(d.zone).toBeNull()
  })

  it('a confirmation for one task never unlocks another task’s page', () => {
    const state = run(
      { type: 'publish', layer: detailLayer(taskU, 'exact') },
      { type: 'setTaskAccess', access: access(taskT, 'exact') },
    )
    const d = drawn(state, '/tasks/task-u')
    expect(d.pins).toEqual([])
    expect(d.route).toBe(false)
    expect(d.you).toBe(false)
  })

  describe('with a focus left by an earlier Search handoff', () => {
    // Search, open T (focus T), then My tasks, then a card to /tasks/U: the
    // host stays mounted, nothing clears the focus, and the page is U's.
    const stale = [
      { type: 'publish', layer: browseLayer },
      { type: 'prepareDetail', taskId: taskT.id },
    ] as const

    it('an approximate viewer of U gets U’s circle, not a blank map', () => {
      const state = run(
        ...stale,
        { type: 'publish', layer: detailLayer(taskU, 'approximate') },
        { type: 'setTaskAccess', access: access(taskU, 'approximate') },
      )
      expect(state.focusTaskId).toBe('task-t')
      const d = drawn(state, '/tasks/task-u')
      expect(d.view.framingTaskId).toBe('task-u')
      expect(d.pins).toEqual([])
      expect(d.zone).toMatchObject({
        taskId: 'task-u',
        lat: taskU.locationLat,
        lng: taskU.locationLng,
      })
      expect(d.view.mapProps?.mapAriaLabel).toBe(LABEL)
    })

    it('an exact viewer of U keeps U’s exact pin, selected, with its route', () => {
      const state = run(
        ...stale,
        { type: 'publish', layer: detailLayer(taskU, 'exact') },
        { type: 'setTaskAccess', access: access(taskU, 'exact') },
      )
      const d = drawn(state, '/tasks/task-u')
      expect(d.view.framingTaskId).toBe('task-u')
      expect(d.pins).toEqual(['task-u'])
      expect(d.selected).toBe('task-u')
      expect(d.pinMode).toBe('solo')
      expect(d.route).toBe(true)
      expect(d.zone).toBeNull()
    })

    it('still draws nothing for U until its viewer is known', () => {
      const state = run(
        ...stale,
        { type: 'publish', layer: detailLayer(taskU, 'exact') },
        { type: 'setTaskAccess', access: access(taskT, 'exact') },
      )
      const d = drawn(state, '/tasks/task-u')
      expect(d.pins).toEqual([])
      expect(d.zone).toBeNull()
    })
  })

  it('leaves /search alone: the focus is the handoff in flight, and no confirmation counts', () => {
    const state = run(
      { type: 'publish', layer: browseLayer },
      { type: 'prepareDetail', taskId: taskT.id },
      { type: 'setTaskAccess', access: access(taskT, 'approximate') },
    )
    const d = drawn(state, '/search', WIDE)
    expect(d.view.onDetailPath).toBe(false)
    expect(d.view.framingTaskId).toBe('task-t')
    expect(d.pins).toEqual(['task-t', 'task-u'])
    expect(d.zone).toBeNull()
    expect(d.view.approxFrame).toBeNull()
  })

  it('hides the map’s stale markers only where it draws no pins on a task page', () => {
    const denied = drawn(
      run(
        { type: 'publish', layer: browseLayer },
        { type: 'prepareDetail', taskId: taskT.id },
      ),
      '/tasks/task-t',
    )
    expect(denied.view.mapProps?.taskPinMode).toBe('none')
    const browsing = drawn(
      run({ type: 'publish', layer: browseLayer }),
      '/search',
    )
    expect(browsing.view.mapProps?.taskPinMode).toBe('all')
  })
})

describe('the host’s framing for the page’s top', () => {
  const approximate = run(
    { type: 'publish', layer: detailLayer(taskT, 'approximate') },
    { type: 'setTaskAccess', access: access(taskT, 'approximate') },
  )

  it('keeps the circle below a status banner above the page on a phone', () => {
    const none = drawn(approximate, '/tasks/task-t', PHONE)
    const banner = drawn(approximate, '/tasks/task-t', PHONE, 45)
    expect(none.view.mapProps?.viewPadding?.top).toBe(4)
    // The page, its chrome and its pill all start 45 px lower: so does the window.
    expect(banner.view.mapProps?.viewPadding?.top).toBe(49)
    expect(banner.view.approxFrame?.window.top).toBe(49)
    expect(banner.view.approxFrame?.pill).toEqual({
      top: 112 + 45,
      bottom: 144 + 45,
    })
    // Same diameter: the window moved, it did not shrink.
    expect(banner.view.approxFrame?.diameterPx).toBe(
      none.view.approxFrame?.diameterPx,
    )
  })

  it('puts the wide pill under the real bar, banner included', () => {
    const none = drawn(approximate, '/tasks/task-t', WIDE)
    const banner = drawn(approximate, '/tasks/task-t', WIDE, 66 + 45)
    expect(none.view.approxFrame?.pill.top).toBe(66 + 56 + 8)
    expect(banner.view.approxFrame?.pill.top).toBe(66 + 45 + 56 + 8)
  })

  it('measures the pill as it is: two lines move the window', () => {
    const wrapped = resolveMarketplaceMapHost({
      state: { ...approximate, approxPillH: 46 },
      pathname: '/tasks/task-t',
      size: { w: 360, h: 740 },
    })
    expect(wrapped.approxFrame).toEqual(
      approxCircleFrame({
        viewport: 'mobile',
        width: 360,
        height: 740,
        pillHeight: 46,
      }),
    )
    expect(APPROX_PILL_ONE_LINE_PX).toBeLessThan(46)
  })
})

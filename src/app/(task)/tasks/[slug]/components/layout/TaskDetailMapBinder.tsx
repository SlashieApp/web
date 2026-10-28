'use client'

import { useMemo } from 'react'

import {
  useMarketplaceMapState,
  usePublishMarketplaceMap,
  usePublishTaskLocationAccess,
} from '@/app/(task)/context/MarketplaceMapSession'
import {
  type MarketplaceMapPublishedLayer,
  type TaskLocationMapAccess,
  shouldKeepBrowseMarketplaceMap,
} from '@/app/(task)/helpers/marketplaceMap'
import { isTaskDetailFromSearchQuery } from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { useI11n } from '@/i18n/useI11n'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskDetailMapCoordinates } from '../../helpers/taskDetailUtils'
import {
  buildTaskDetailMapPinTask,
  taskDetailSearchRouteOriginFromLocationSearch,
} from '../../helpers/taskLocationMap'
import bag from '../../i11n.json'

/**
 * Drive the shared marketplace Mapbox for a task-detail load, by what the
 * viewer may see (`locationAccess`, FE-472):
 * - exact (the poster, the accepted worker): the price pin, and the route and
 *   You marker when opened from `/search`. Also from `/search`: the detail
 *   layer replaces the browse one, so the pin is the exact point, not the
 *   browse pin at the public point.
 * - approximate: no pin, no route, no You marker, no distance. A cold load
 *   publishes a layer with no pins; opened from `/search` the live browse
 *   canvas stays and the host hides its pins and draws the circle.
 * - pending (signed in, role not known yet): no layer. The host keeps every
 *   pin off until this says otherwise.
 * The circle's centre is `location` as the API returned it, never the order
 * snapshot, a search centre from the URL, or anything derived on the client.
 */
export function TaskDetailMapBinder() {
  const { task, taskId, permissions, myOrder, me, locationAccess } =
    useTaskDetail()
  const t = useI11n(bag)
  const approxLabel = t.details.locationApproxPill
  const { published, focusTaskId } = useMarketplaceMapState()
  const fromSearch =
    typeof window === 'undefined'
      ? false
      : isTaskDetailFromSearchQuery(window.location.search)
  const keepBrowse = shouldKeepBrowseMarketplaceMap({
    published,
    taskId,
    focusTaskId,
    fromSearch,
  })

  const hasTask = Boolean(task)
  const coords = task
    ? taskDetailMapCoordinates(task, myOrder, locationAccess === 'exact')
    : null
  const lat = coords?.lat
  const lng = coords?.lng

  const access = useMemo<TaskLocationMapAccess | null>(
    () =>
      hasTask
        ? {
            taskId,
            access: locationAccess,
            center: lat != null && lng != null ? { lat, lng } : null,
            approxLabel,
          }
        : null,
    [hasTask, taskId, locationAccess, lat, lng, approxLabel],
  )

  const layer = useMemo<MarketplaceMapPublishedLayer | null>(() => {
    if (!task || lat == null || lng == null) return null
    if (locationAccess === 'pending') return null

    if (locationAccess === 'approximate') {
      // Opened from /search: the host draws the circle on the live canvas.
      if (keepBrowse) return null
      return {
        source: 'detail',
        cameraMode: 'detail',
        variant: 'approximate',
        props: {
          accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
          centerLat: lat,
          centerLng: lng,
          radiusMiles: 2,
          tasks: [],
          visible: true,
          tasksLoaded: true,
          selectedTaskId: null,
          logoPosition: 'bottom-right',
          showReferenceMarker: false,
          navRouteEnabled: false,
          mapAriaLabel: approxLabel,
        },
      }
    }

    const origin =
      typeof window === 'undefined'
        ? null
        : taskDetailSearchRouteOriginFromLocationSearch(window.location.search)

    const pinTask = buildTaskDetailMapPinTask(
      task,
      { lat, lng },
      permissions.isOwner ? 'owner' : 'visitor',
      me?.id,
      origin,
    )

    return {
      source: 'detail',
      cameraMode: 'detail',
      variant: 'exact',
      props: {
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        centerLat: origin?.lat ?? lat,
        centerLng: origin?.lng ?? lng,
        radiusMiles: 2,
        tasks: [pinTask],
        visible: true,
        tasksLoaded: true,
        selectedTaskId: task.id,
        logoPosition: 'bottom-right',
        showReferenceMarker: Boolean(origin),
        navRouteEnabled: Boolean(origin),
        mapAriaLabel: 'Map of this task location',
      },
    }
  }, [
    keepBrowse,
    task,
    permissions.isOwner,
    me?.id,
    locationAccess,
    lat,
    lng,
    approxLabel,
  ])

  usePublishMarketplaceMap(layer)
  usePublishTaskLocationAccess(access)

  return null
}

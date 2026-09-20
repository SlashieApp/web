'use client'

import { useMemo } from 'react'

import {
  useMarketplaceMapState,
  usePublishMarketplaceMap,
} from '@/app/(task)/context/MarketplaceMapSession'
import {
  type MarketplaceMapPublishedLayer,
  shouldKeepBrowseMarketplaceMap,
} from '@/app/(task)/helpers/marketplaceMap'
import { isTaskDetailFromSearchQuery } from '@/app/(task)/helpers/openTaskDetailFromBrowse'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskDetailMapCoordinates } from '../../helpers/taskDetailUtils'
import {
  buildTaskDetailMapPinTask,
  taskDetailSearchRouteOriginFromLocationSearch,
} from '../../helpers/taskLocationMap'

/**
 * Drive the shared marketplace Mapbox for a cold task-detail load.
 * Opening a task from `/search` keeps the live browse canvas (every pin
 * and the current camera) instead of publishing a replacement layer.
 */
export function TaskDetailMapBinder() {
  const { task, taskId, permissions, myOrder, me } = useTaskDetail()
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

  const layer = useMemo<MarketplaceMapPublishedLayer | null>(() => {
    if (keepBrowse || !task) return null
    const coords = taskDetailMapCoordinates(task, myOrder)
    const lat = coords?.lat
    const lng = coords?.lng
    if (lat == null || lng == null) return null

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
  }, [keepBrowse, task, permissions.isOwner, myOrder, me?.id])

  usePublishMarketplaceMap(layer)

  return null
}

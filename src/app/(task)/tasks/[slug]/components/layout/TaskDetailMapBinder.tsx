'use client'

import { useMemo } from 'react'

import { usePublishMarketplaceMap } from '@/app/(task)/context/MarketplaceMapSession'
import type { MarketplaceMapPublishedLayer } from '@/app/(task)/helpers/marketplaceMap'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskDetailMapCoordinates } from '../../helpers/taskDetailUtils'
import {
  buildTaskDetailMapPinTask,
  taskDetailSearchRouteOriginFromLocationSearch,
} from '../../helpers/taskLocationMap'

/**
 * Drive the shared marketplace Mapbox (search → detail) for this task:
 * the selected search pin (price + miles) only, camera framed to the window.
 */
export function TaskDetailMapBinder() {
  const { task, permissions, myOrder, me } = useTaskDetail()

  const layer = useMemo<MarketplaceMapPublishedLayer | null>(() => {
    if (!task) return null
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
  }, [task, permissions.isOwner, myOrder, me?.id])

  usePublishMarketplaceMap(layer)

  return null
}

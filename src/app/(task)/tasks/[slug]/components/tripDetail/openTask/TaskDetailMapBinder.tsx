'use client'

import { useMemo } from 'react'

import { usePublishMarketplaceMap } from '@/app/(task)/context/MarketplaceMapSession'
import type { MarketplaceMapPublishedLayer } from '@/app/(task)/helpers/marketplaceMap'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../../helpers/taskDetailUtils'
import {
  buildTaskDetailMapPinTask,
  taskDetailSearchRouteOriginFromLocationSearch,
} from '../../../helpers/taskLocationMap'

/**
 * Drive the shared marketplace Mapbox (search → detail) for this task:
 * You + this pin only, camera framed to the visible map window.
 */
export function TaskDetailMapBinder() {
  const { task, permissions, myOrder, me } = useTaskDetail()

  const layer = useMemo<MarketplaceMapPublishedLayer | null>(() => {
    if (!task) return null
    const coords = taskDetailMapCoordinates(task, myOrder)
    const lat = coords?.lat
    const lng = coords?.lng
    if (lat == null || lng == null) return null

    const showExact = taskDetailShowsExactLocation({
      myOrder,
      showFullAddress: permissions.showFullAddress,
    })
    const variant = showExact ? 'exact' : 'approximate'
    const origin =
      typeof window === 'undefined'
        ? null
        : taskDetailSearchRouteOriginFromLocationSearch(window.location.search)

    const pinTask = showExact
      ? buildTaskDetailMapPinTask(
          task,
          { lat, lng },
          permissions.isOwner ? 'owner' : 'visitor',
          me?.id,
        )
      : {
          id: task.id,
          title: task.title,
          locationLat: lat,
          locationLng: lng,
        }

    return {
      source: 'detail',
      cameraMode: 'detail',
      variant,
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
  }, [task, permissions.showFullAddress, permissions.isOwner, myOrder, me?.id])

  usePublishMarketplaceMap(layer)

  return null
}

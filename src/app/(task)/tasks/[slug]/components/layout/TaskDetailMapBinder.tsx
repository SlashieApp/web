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
import {
  buildTaskDetailMapLayer,
  buildTaskLocationMapAccess,
} from '../../helpers/taskDetailMapLayer'
import { taskDetailSearchRouteOriginFromLocationSearch } from '../../helpers/taskLocationMap'
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

  const access = useMemo<TaskLocationMapAccess | null>(
    () =>
      buildTaskLocationMapAccess({
        task,
        taskId,
        locationAccess,
        myOrder,
        approxLabel,
      }),
    [task, taskId, locationAccess, myOrder, approxLabel],
  )

  const layer = useMemo<MarketplaceMapPublishedLayer | null>(
    () =>
      buildTaskDetailMapLayer({
        task,
        locationAccess,
        myOrder,
        isOwner: permissions.isOwner,
        meId: me?.id,
        approxLabel,
        keepBrowse,
        // Only an exact viewer's route uses it.
        origin:
          typeof window === 'undefined'
            ? null
            : taskDetailSearchRouteOriginFromLocationSearch(
                window.location.search,
              ),
        accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      }),
    [
      keepBrowse,
      task,
      permissions.isOwner,
      me?.id,
      myOrder,
      locationAccess,
      approxLabel,
    ],
  )

  usePublishMarketplaceMap(layer)
  usePublishTaskLocationAccess(access)

  return null
}

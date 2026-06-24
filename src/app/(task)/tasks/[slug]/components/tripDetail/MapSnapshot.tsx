'use client'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import { LocationMap } from '../metaSection/LocationMap'

/**
 * Map snapshot under the status header. Redaction is preserved: exact pin for the
 * owner / order worker (`showFullAddress`), an approximate area circle otherwise.
 */
export function MapSnapshot() {
  const { task, myOrder, permissions } = useTaskDetail()
  if (!task) return null

  const coords = taskDetailMapCoordinates(task, myOrder)
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!coords || !token?.trim()) return null

  const showExact = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress: permissions.showFullAddress,
  })

  return (
    <LocationMap
      accessToken={token}
      lat={coords.lat}
      lng={coords.lng}
      height="200px"
      variant={showExact ? 'exact' : 'approximate'}
    />
  )
}

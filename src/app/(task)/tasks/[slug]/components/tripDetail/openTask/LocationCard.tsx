'use client'

import { Card, MapCard } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../../helpers/taskDetailUtils'

/** "Location" card — exact pin for parties, approximate area otherwise. */
export function LocationCard() {
  const { task, myOrder, permissions } = useTaskDetail()
  const coords = task ? taskDetailMapCoordinates(task, myOrder) : null
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!coords || !token?.trim()) return null

  const showExact = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress: permissions.showFullAddress,
  })

  return (
    <Card layout="section" heading="Location">
      <MapCard
        accessToken={token}
        lat={coords.lat}
        lng={coords.lng}
        height="200px"
        variant={showExact ? 'exact' : 'approximate'}
      />
    </Card>
  )
}

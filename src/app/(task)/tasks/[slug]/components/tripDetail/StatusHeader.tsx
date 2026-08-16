'use client'

import { Box } from '@chakra-ui/react'
import { useMemo } from 'react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import { buildTaskDetailMapPinTask } from '../../helpers/taskLocationMap'
import { TaskHeaderControls } from './TaskHeaderControls'
import { TaskLocationHeroMap } from './openTask/TaskLocationHeroMap'

/**
 * Mobile map hero. Overlay back + overflow while the map is visible; the
 * compact sticky header takes those controls once the map collapses.
 * Status copy lives in chips + the real task title — not here.
 */
export function StatusHeader({ collapsed = false }: { collapsed?: boolean }) {
  const { permissions, task, myOrder, me } = useTaskDetail()

  const coords = task ? taskDetailMapCoordinates(task, myOrder) : null
  const showExact = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress: permissions.showFullAddress,
  })
  const lat = coords?.lat
  const lng = coords?.lng

  const pinTask = useMemo(() => {
    if (!task || !showExact || lat == null || lng == null) return undefined
    return buildTaskDetailMapPinTask(
      task,
      { lat, lng },
      permissions.isOwner ? 'owner' : 'visitor',
      me?.id,
    )
  }, [task, showExact, lat, lng, permissions.isOwner, me?.id])

  if (!task) return null

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  return (
    <TaskLocationHeroMap
      accessToken={token}
      lat={coords?.lat}
      lng={coords?.lng}
      variant={showExact ? 'exact' : 'approximate'}
      enableRoute={showExact}
      pinTask={pinTask}
      hideMap={collapsed}
      minH="260px"
    >
      <TaskHeaderControls overlay hidden={collapsed} />
      <Box flex={1} />
    </TaskLocationHeroMap>
  )
}

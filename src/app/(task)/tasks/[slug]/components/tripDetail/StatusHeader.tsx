'use client'

import { useMemo } from 'react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import { buildTaskDetailMapPinTask } from '../../helpers/taskLocationMap'
import { TaskLocationHeroMap } from './openTask/TaskLocationHeroMap'

/**
 * Mobile map hero. Title / status / budget live in the sticky money chrome
 * below this map so they persist on scroll without covering the hero.
 */
export function StatusHeader() {
  const { permissions, task, pending, myOrder, me } = useTaskDetail()

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

  if (!task && !pending) return null

  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  return (
    <TaskLocationHeroMap
      accessToken={token}
      lat={coords?.lat}
      lng={coords?.lng}
      variant={showExact ? 'exact' : 'approximate'}
      enableRoute={showExact}
      pinTask={pinTask}
      minH={{ base: '220px', md: '280px' }}
    />
  )
}

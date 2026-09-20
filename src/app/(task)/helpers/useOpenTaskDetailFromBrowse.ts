'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import {
  type TaskDetailOpenedFromSearchSurface,
  captureTaskDetailOpenedFromSearch,
} from '@/utils/analytics'
import { getAuthToken } from '@/utils/auth'

import { useMarketplaceMapDispatch } from '../context/MarketplaceMapSession'
import { useTaskBrowseData } from '../context/TaskBrowseProvider'
import {
  isSearchBrowsePath,
  taskDetailHrefFromBrowse,
} from './openTaskDetailFromBrowse'

export function useOpenTaskDetailFromBrowse() {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const localize = useLocalizedHref()
  const fromSearch = isSearchBrowsePath(pathname)
  const { referenceLocation } = useTaskBrowseData()
  const mapSession = useMarketplaceMapDispatch()

  const taskDetailHref = useCallback(
    (taskId: string) =>
      taskDetailHrefFromBrowse(taskId, {
        fromSearch,
        lat: fromSearch ? referenceLocation.lat : undefined,
        lng: fromSearch ? referenceLocation.lng : undefined,
      }),
    [fromSearch, referenceLocation.lat, referenceLocation.lng],
  )

  const openTaskDetail = useCallback(
    (taskId: string, surface: TaskDetailOpenedFromSearchSurface) => {
      if (fromSearch) {
        captureTaskDetailOpenedFromSearch({
          taskId,
          isAuthenticated: Boolean(getAuthToken()),
          surface,
        })
        mapSession?.prepareDetail(taskId)
      }
      router.push(localize(taskDetailHref(taskId)))
    },
    [fromSearch, localize, mapSession, router, taskDetailHref],
  )

  const captureDetailsLink = useCallback(
    (taskId: string, surface: TaskDetailOpenedFromSearchSurface) => {
      if (!fromSearch) return
      mapSession?.prepareDetail(taskId)
      captureTaskDetailOpenedFromSearch({
        taskId,
        isAuthenticated: Boolean(getAuthToken()),
        surface,
      })
    },
    [fromSearch, mapSession],
  )

  return { fromSearch, taskDetailHref, openTaskDetail, captureDetailsLink }
}

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import {
  type TaskDetailOpenedFromSearchSurface,
  captureTaskDetailOpenedFromSearch,
} from '@/utils/analytics'
import { getAuthToken } from '@/utils/auth'

import {
  isSearchBrowsePath,
  taskDetailHrefFromBrowse,
} from './openTaskDetailFromBrowse'

export function useOpenTaskDetailFromBrowse() {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const localize = useLocalizedHref()
  const fromSearch = isSearchBrowsePath(pathname)

  const taskDetailHref = useCallback(
    (taskId: string) => taskDetailHrefFromBrowse(taskId, { fromSearch }),
    [fromSearch],
  )

  const openTaskDetail = useCallback(
    (taskId: string, surface: TaskDetailOpenedFromSearchSurface) => {
      if (fromSearch) {
        captureTaskDetailOpenedFromSearch({
          taskId,
          isAuthenticated: Boolean(getAuthToken()),
          surface,
        })
      }
      router.push(localize(taskDetailHref(taskId)))
    },
    [fromSearch, localize, router, taskDetailHref],
  )

  const captureDetailsLink = useCallback(
    (taskId: string, surface: TaskDetailOpenedFromSearchSurface) => {
      if (!fromSearch) return
      captureTaskDetailOpenedFromSearch({
        taskId,
        isAuthenticated: Boolean(getAuthToken()),
        surface,
      })
    },
    [fromSearch],
  )

  return { fromSearch, taskDetailHref, openTaskDetail, captureDetailsLink }
}

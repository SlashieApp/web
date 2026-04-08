'use client'

import { createContext, useContext, useMemo, useState } from 'react'

type TaskBrowseLayoutContextValue = {
  isFilterOpen: boolean
  setIsFilterOpen: (v: boolean) => void
  windowOffsetWidth: number
}

const TaskBrowseLayoutContext =
  createContext<TaskBrowseLayoutContextValue | null>(null)

export function TaskBrowseLayoutProvider({
  children,
  isDesktop,
}: {
  children: React.ReactNode
  isDesktop: boolean
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const value = useMemo<TaskBrowseLayoutContextValue>(
    () => ({
      isFilterOpen,
      setIsFilterOpen,
      windowOffsetWidth: isDesktop ? 540 : 80,
    }),
    [isFilterOpen, isDesktop],
  )

  return (
    <TaskBrowseLayoutContext.Provider value={value}>
      {children}
    </TaskBrowseLayoutContext.Provider>
  )
}

export function useTaskBrowseLayout() {
  const ctx = useContext(TaskBrowseLayoutContext)
  if (!ctx) {
    throw new Error(
      'useTaskBrowseLayout must be used within TaskBrowseLayoutProvider',
    )
  }
  return ctx
}

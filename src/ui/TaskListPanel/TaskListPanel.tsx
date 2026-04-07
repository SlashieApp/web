'use client'

import type { ReactNode } from 'react'

import { TaskBrowseFloatingPanel } from '../TaskBrowseFloatingPanel/TaskBrowseFloatingPanel'

export type TaskListPanelProps = {
  children: ReactNode
}

export function TaskListPanel({ children }: TaskListPanelProps) {
  return (
    <TaskBrowseFloatingPanel
      flex="1"
      minW={0}
      minH={0}
      w={{ md: 'min(420px, 38vw)' }}
      maxW="440px"
    >
      {children}
    </TaskBrowseFloatingPanel>
  )
}

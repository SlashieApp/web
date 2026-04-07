'use client'

import { type ReactNode, createContext, useContext, useRef } from 'react'
import { useStore } from 'zustand/react'
import { useShallow } from 'zustand/react/shallow'

import {
  type TaskBrowseState,
  type TaskBrowseStoreApi,
  createTaskBrowseStore,
} from './taskBrowseStore'

const TaskBrowseStoreContext = createContext<TaskBrowseStoreApi | null>(null)

export function TaskBrowseProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<TaskBrowseStoreApi | null>(null)
  if (!storeRef.current) {
    storeRef.current = createTaskBrowseStore()
  }
  return (
    <TaskBrowseStoreContext.Provider value={storeRef.current}>
      {children}
    </TaskBrowseStoreContext.Provider>
  )
}

export function useTaskBrowseStore<T>(
  selector: (state: TaskBrowseState) => T,
): T {
  const store = useContext(TaskBrowseStoreContext)
  if (!store) {
    throw new Error('useTaskBrowseStore must be used within TaskBrowseProvider')
  }
  return useStore(store, selector)
}

export function useTaskBrowseSelection() {
  const store = useContext(TaskBrowseStoreContext)
  if (!store) {
    throw new Error(
      'useTaskBrowseSelection must be used within TaskBrowseProvider',
    )
  }
  return useStore(
    store,
    useShallow((s) => ({
      selectedTaskId: s.selectedTaskId,
      setSelectedTaskId: s.setSelectedTaskId,
    })),
  )
}

export function useTaskBrowseSearch() {
  const store = useContext(TaskBrowseStoreContext)
  if (!store) {
    throw new Error(
      'useTaskBrowseSearch must be used within TaskBrowseProvider',
    )
  }
  return useStore(
    store,
    useShallow((s) => ({
      searchInput: s.searchInput,
      debouncedSearch: s.debouncedSearch,
      setSearchInput: s.setSearchInput,
    })),
  )
}

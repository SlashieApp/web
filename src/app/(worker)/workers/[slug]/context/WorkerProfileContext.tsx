'use client'

import { createContext, useContext } from 'react'

import type { WorkerPublicRecord } from '../helpers/workerProfileHelpers'

type WorkerProfileContextValue = {
  worker: WorkerPublicRecord
}

const WorkerProfileContext = createContext<WorkerProfileContextValue | null>(
  null,
)

export function WorkerProfileProvider({
  worker,
  children,
}: {
  worker: WorkerPublicRecord
  children: React.ReactNode
}) {
  return (
    <WorkerProfileContext.Provider value={{ worker }}>
      {children}
    </WorkerProfileContext.Provider>
  )
}

export function useWorkerProfile(): WorkerProfileContextValue {
  const value = useContext(WorkerProfileContext)
  if (!value) {
    throw new Error(
      'useWorkerProfile must be used within WorkerProfileProvider',
    )
  }
  return value
}

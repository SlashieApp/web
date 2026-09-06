let handoff: WorkerCardHandoff | null = null

/** Card fields that can paint the profile immediately on listing → detail. */
export type WorkerCardHandoff = {
  id: string
  name: string
  avatarUrl?: string | null
  verified?: boolean
  subtitle?: string | null
  ratingLabel?: string | null
  experienceLabel?: string | null
  respondsLabel?: string | null
  serviceAreaLabel?: string | null
  skills?: readonly string[]
}

export function setWorkerHandoff(vm: WorkerCardHandoff): void {
  handoff = vm
}

/** Id-matched so a stale click can never seed a different worker. */
export function workerHandoffFor(id: string): WorkerCardHandoff | null {
  return handoff?.id === id ? handoff : null
}

export function workerVtName(
  kind: 'img' | 'name' | 'subtitle' | 'rating' | 'area' | 'responds' | 'skills',
  id: string,
): string {
  return `worker-${kind}-${id}`
}

import type { TaskCardTask } from '@/app/(task)/components/TaskCard'

let handoff: TaskCardTask | null = null

export function setTaskHandoff(vm: TaskCardTask): void {
  handoff = vm
}

/** Id-matched so a stale click can never seed a different task. */
export function taskHandoffFor(id: string): TaskCardTask | null {
  return handoff?.id === id ? handoff : null
}

export function taskVtName(
  kind: 'img' | 'title' | 'price',
  id: string,
): string {
  return `task-${kind}-${id}`
}

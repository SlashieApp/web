import type { MeSnapshot } from '@/app/(auth)/store/user'
import { SKILLS_MIN } from '@/app/(stepflow)/worker/setup/helpers/workerSetupSkills'
import {
  BIO_MIN_CHARS,
  HEADLINE_MIN_CHARS,
} from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'

export type WorkerProfileTodo =
  | 'photo'
  | 'headline'
  | 'bio'
  | 'skills'
  | 'serviceArea'
  | 'portfolio'

/**
 * What a worker could still add to their profile, by the same floors as the
 * setup and edit forms. Portfolio is optional, so it comes last.
 */
export function workerProfileTodos(me: MeSnapshot): WorkerProfileTodo[] {
  const worker = me.worker
  if (!worker) return []
  const serviceArea =
    worker.preferredLocation?.name?.trim() ||
    worker.preferredLocation?.address?.trim() ||
    worker.locationAddress?.trim()
  const todos: WorkerProfileTodo[] = []
  if (!me.profile?.avatarUrl?.trim()) todos.push('photo')
  if ((worker.tagline?.trim().length ?? 0) < HEADLINE_MIN_CHARS) {
    todos.push('headline')
  }
  if ((worker.bio?.trim().length ?? 0) < BIO_MIN_CHARS) todos.push('bio')
  if ((worker.skills?.length ?? 0) < SKILLS_MIN) todos.push('skills')
  if (!serviceArea) todos.push('serviceArea')
  if (!worker.portfolioUrls?.length) todos.push('portfolio')
  return todos
}

/** The minimum a to-do names ("Write a bio of 80+ characters"). */
export const WORKER_TODO_COUNTS: Partial<Record<WorkerProfileTodo, number>> = {
  bio: BIO_MIN_CHARS,
  skills: SKILLS_MIN,
}

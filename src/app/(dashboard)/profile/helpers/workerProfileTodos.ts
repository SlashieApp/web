import { WorkerProfileGap } from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { SKILLS_MIN } from '@/app/(stepflow)/worker/setup/helpers/workerSetupSkills'
import { BIO_MIN_CHARS } from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'

export type WorkerProfileTodo =
  | 'photo'
  | 'headline'
  | 'bio'
  | 'skills'
  | 'serviceArea'
  | 'portfolio'

const TODO_BY_GAP: Record<WorkerProfileGap, WorkerProfileTodo> = {
  [WorkerProfileGap.Photo]: 'photo',
  [WorkerProfileGap.Headline]: 'headline',
  [WorkerProfileGap.Bio]: 'bio',
  [WorkerProfileGap.Skills]: 'skills',
  [WorkerProfileGap.ServiceArea]: 'serviceArea',
  [WorkerProfileGap.Portfolio]: 'portfolio',
}

/**
 * What a worker could still add to their profile: the API's
 * `worker.profileGaps`, which applies the same floors as the edit form and
 * puts the optional portfolio last. No rules are worked out here.
 */
export function workerProfileTodos(me: MeSnapshot): WorkerProfileTodo[] {
  return (me.worker?.profileGaps ?? []).flatMap((gap) => {
    const todo = TODO_BY_GAP[gap]
    return todo ? [todo] : []
  })
}

/** The minimum a to-do names ("Write a bio of 80+ characters"). */
export const WORKER_TODO_COUNTS: Partial<Record<WorkerProfileTodo, number>> = {
  bio: BIO_MIN_CHARS,
  skills: SKILLS_MIN,
}

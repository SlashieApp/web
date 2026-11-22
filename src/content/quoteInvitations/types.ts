import type { PublicProfileQuery } from '@codegen/schema'

type ProfileViewer = NonNullable<
  NonNullable<
    NonNullable<PublicProfileQuery['publicProfile']>['worker']
  >['viewer']
>

/**
 * One row of the profile chooser: `worker.viewer.askableTasks`. The task's
 * quotes are its live (PENDING) ones; the API omits withdrawn and expired.
 */
export type AskableTaskRow = ProfileViewer['askableTasks'][number]

/** A task the customer can be asked about, ready to render. */
export type AskableTaskChoice = {
  id: string
  title: string
  quoteCount: number
  alreadyAsked: boolean
  canAsk: boolean
}

/**
 * Where the invitation was sent from: the worker's profile, the prompt after
 * Post a task, or the task's Find worker list (FE-603, Slashie Pro).
 */
export type QuoteInviteSurface = 'profile' | 'after_post' | 'find_worker'

import type { AskableTask, Task } from '@codegen/schema'

/**
 * Hand-written until the next `bun run codegen` (FE-507): the operation types
 * for the quote invitation fields. They mirror the schema types, so the
 * generated ones can replace them without changing a caller.
 */

/** One row of the profile chooser: `worker.viewer.askableTasks`. */
export type AskableTaskRow = Pick<AskableTask, 'alreadyAsked' | 'canAsk'> & {
  task: Pick<Task, 'id' | 'title'> & {
    /** Live (PENDING) quotes are counted; the API omits withdrawn and expired ones. */
    quotes: { status: string }[]
  }
}

/** A task the customer can be asked about, ready to render. */
export type AskableTaskChoice = {
  id: string
  title: string
  quoteCount: number
  alreadyAsked: boolean
  canAsk: boolean
}

export type QuoteInviteSurface = 'profile' | 'after_post'

export type AskWorkerToQuoteMutationVariables = {
  taskId: string
  workerUserId: string
}

export type AskWorkerToQuoteMutation = {
  askWorkerToQuote: { taskId: string; workerUserId: string; createdAt: string }
}

export type DismissQuoteInvitationMutationVariables = { taskId: string }

export type DismissQuoteInvitationMutation = {
  dismissQuoteInvitation: { taskId: string; dismissedAt: string }
}

import { QuoteStatus } from '@codegen/schema'

import type { AskableTaskChoice, AskableTaskRow } from './types'

/** The chooser's rows in the API's order (newest first), with live quotes counted. */
export function toAskableTaskChoices(
  rows: readonly AskableTaskRow[],
): AskableTaskChoice[] {
  return rows.map((row) => ({
    id: row.task.id,
    title: row.task.title,
    quoteCount: row.task.quotes.filter(
      (quote) => quote.status === QuoteStatus.Pending,
    ).length,
    alreadyAsked: row.alreadyAsked,
    canAsk: row.canAsk,
  }))
}

/** What a tap on Ask does: the chooser, or Post a task carrying the worker. */
export function askTapTarget(
  choices: readonly AskableTaskChoice[],
): 'chooser' | 'postTask' {
  return choices.length > 0 ? 'chooser' : 'postTask'
}

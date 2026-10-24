import { QuoteStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { taskDetailQuoteRows } from './taskDetailQuoteRows'

const quotes = [
  { id: 'mine', status: QuoteStatus.Pending },
  { id: 'live-1', status: QuoteStatus.Pending },
  { id: 'closed', status: 'CLOSED' },
  { id: 'live-2', status: QuoteStatus.Pending },
  { id: 'accepted', status: QuoteStatus.Accepted },
]
const ids = (rows: readonly { id: string }[]) => rows.map((row) => row.id)

describe('taskDetailQuoteRows', () => {
  it('lists every quote for the owner, open or not', () => {
    for (const isOpen of [true, false]) {
      expect(
        ids(
          taskDetailQuoteRows(quotes, {
            isOwner: true,
            isOpen,
            myQuoteId: null,
          }),
        ),
      ).toEqual(['mine', 'live-1', 'closed', 'live-2', 'accepted'])
    }
  })

  it('lists the other live quotes for anyone else while the task is open', () => {
    expect(
      ids(
        taskDetailQuoteRows(quotes, {
          isOwner: false,
          isOpen: true,
          myQuoteId: 'mine',
        }),
      ),
    ).toEqual(['live-1', 'live-2'])
    // A guest has no quote of their own.
    expect(
      ids(
        taskDetailQuoteRows(quotes, {
          isOwner: false,
          isOpen: true,
          myQuoteId: null,
        }),
      ),
    ).toEqual(['mine', 'live-1', 'live-2'])
  })

  it('lists nothing for anyone else once the task is not open', () => {
    expect(
      taskDetailQuoteRows(quotes, {
        isOwner: false,
        isOpen: false,
        myQuoteId: 'mine',
      }),
    ).toEqual([])
  })
})

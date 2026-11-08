import { QuoteStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { askTapTarget, toAskableTaskChoices } from './askableTasks'

const row = (
  id: string,
  quotes: QuoteStatus[],
  flags: { alreadyAsked?: boolean; canAsk?: boolean } = {},
) => ({
  alreadyAsked: flags.alreadyAsked ?? false,
  canAsk: flags.canAsk ?? true,
  task: {
    id,
    title: `Task ${id}`,
    quotes: quotes.map((status) => ({ status })),
  },
})

describe('toAskableTaskChoices', () => {
  it('keeps the API order and counts live quotes only', () => {
    const choices = toAskableTaskChoices([
      row('b', [
        QuoteStatus.Pending,
        QuoteStatus.Pending,
        QuoteStatus.Withdrawn,
      ]),
      row('a', []),
    ])
    expect(choices.map((c) => [c.id, c.quoteCount])).toEqual([
      ['b', 2],
      ['a', 0],
    ])
  })

  it('carries the API flags through', () => {
    const [choice] = toAskableTaskChoices([
      row('a', [], { alreadyAsked: true, canAsk: false }),
    ])
    expect(choice).toMatchObject({ alreadyAsked: true, canAsk: false })
  })
})

describe('askTapTarget', () => {
  it('opens the chooser when there are open tasks, even none askable', () => {
    expect(askTapTarget(toAskableTaskChoices([row('a', [])]))).toBe('chooser')
    expect(
      askTapTarget(toAskableTaskChoices([row('a', [], { canAsk: false })])),
    ).toBe('chooser')
  })

  it('goes to Post a task when there is no open task', () => {
    expect(askTapTarget([])).toBe('postTask')
  })
})

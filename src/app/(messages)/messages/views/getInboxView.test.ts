import { afterAll, describe, expect, it } from 'vitest'

import {
  INBOX_VIEWS,
  type InboxViewInput,
  type InboxViewName,
  getInboxView,
} from '.'

const seen = new Set<InboxViewName>()
const view = (query: InboxViewInput['query'], threadCount = 0) => {
  const result = getInboxView({ query, threadCount })
  seen.add(result)
  return result
}

describe('getInboxView', () => {
  it('shows skeleton rows while the inbox loads', () => {
    expect(view('loading')).toBe('inbox.loading')
  })

  it('offers Try again when the inbox could not load', () => {
    expect(view('error')).toBe('inbox.error')
  })

  it('says there are no messages yet when there are no conversations', () => {
    expect(view('ready', 0)).toBe('inbox.empty')
  })

  it('lists the conversations once they load', () => {
    expect(view('ready', 3)).toBe('inbox.list')
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(INBOX_VIEWS).sort())
  })
})

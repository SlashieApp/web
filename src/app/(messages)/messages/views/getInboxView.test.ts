import { afterAll, describe, expect, it } from 'vitest'

import {
  INBOX_VIEWS,
  type InboxViewInput,
  type InboxViewName,
  getInboxView,
} from '.'

const seen = new Set<InboxViewName>()
/** `matchCount` is every conversation unless the search or filter leaves fewer. */
const view = (
  query: InboxViewInput['query'],
  threadCount = 0,
  matchCount = threadCount,
) => {
  const result = getInboxView({ query, threadCount, matchCount })
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

  it('lists what the search and filter leave', () => {
    expect(view('ready', 3, 1)).toBe('inbox.list')
  })

  it('says nothing matches when the search and filter leave none', () => {
    expect(view('ready', 3, 0)).toBe('inbox.noMatches')
  })

  it('shows the search box and filter button once there is something to search', () => {
    const withSearch = Object.entries(INBOX_VIEWS)
      .filter(([, config]) => config.search)
      .map(([name]) => name)
    expect(withSearch.sort()).toEqual(['inbox.list', 'inbox.noMatches'])
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(INBOX_VIEWS).sort())
  })
})

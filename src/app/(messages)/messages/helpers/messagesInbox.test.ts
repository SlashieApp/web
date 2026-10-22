import { ThreadAttentionKind, ThreadKind } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { INBOX_FILTERS, type InboxFilter, filterThreads } from './messagesInbox'

const ME = 'user-me'

const message = (body: string) => ({ title: null, body })
const flash = (title: string, body: string) => ({ title, body })

type TestThread = {
  id: string
  kind: ThreadKind
  title: string
  unreadCount: number
  attention: { kind: ThreadAttentionKind } | null
  task: { poster?: { id: string } | null } | null
  otherParty: { name: string } | null
  lastItem: { title: string | null; body: string } | null
}

/** A task I posted with nothing else set; each thread changes what it needs. */
const thread = (
  overrides: Partial<TestThread> & { id: string },
): TestThread => ({
  kind: ThreadKind.Task,
  title: 'Task',
  unreadCount: 0,
  attention: null,
  task: { poster: { id: ME } },
  otherParty: null,
  lastItem: null,
  ...overrides,
})

/** Posted by me, booked with Jordan, two unread. */
const booked = thread({
  id: 'booked',
  title: 'Mount bookshelf on living room wall',
  unreadCount: 2,
  otherParty: { name: 'Jordan Lee' },
  lastItem: message('I will bring the drill and the spirit level.'),
})
/** Posted by me, no one booked: quotes to compare. */
const quotes = thread({
  id: 'quotes',
  title: 'Garden tidy-up',
  attention: { kind: ThreadAttentionKind.CompareQuotes },
  lastItem: flash('New quote: £80', 'Sam can come on Saturday morning.'),
})
/** Someone else's task, which I'm doing; the booking is ready to close. */
const repair = thread({
  id: 'repair',
  title: 'Fix a leaking kitchen tap',
  attention: { kind: ThreadAttentionKind.MarkDone },
  task: { poster: { id: 'user-sam' } },
  otherParty: { name: 'Sam Taylor' },
  lastItem: message('See you at 9, the key is under the mat.'),
})
/** Someone else's task, where I sent a quote: one unread, an accent in the name. */
const fence = thread({
  id: 'fence',
  title: 'Paint the garden fence',
  unreadCount: 1,
  task: { poster: { id: 'user-chloe' } },
  otherParty: { name: 'Chloé Martin' },
  lastItem: flash('Quote sent: £60', 'You offered to paint it on Saturday.'),
})
const slashie = thread({
  id: 'slashie',
  kind: ThreadKind.System,
  title: 'Slashie',
  task: null,
  lastItem: flash('New: message workers in the app', 'Chat once you accept.'),
})

const inbox = [booked, quotes, repair, fence, slashie]

const ids = (threads: readonly { id: string }[]) => threads.map((t) => t.id)
const find = (
  searchText: string,
  filter: InboxFilter = 'all',
  meId: string | null = ME,
  threads: readonly TestThread[] = inbox,
) => ids(filterThreads(threads, { searchText, filter, meId }))

describe('filterThreads: search', () => {
  it('finds a conversation by the other person', () => {
    expect(find('jordan')).toEqual(['booked'])
    expect(find('Taylor')).toEqual(['repair'])
  })

  it("finds a conversation by the thread's title, the task's", () => {
    expect(find('bookshelf')).toEqual(['booked'])
    expect(find('leaking')).toEqual(['repair'])
  })

  it('finds a conversation by the latest message', () => {
    expect(find('spirit level')).toEqual(['booked'])
    expect(find('under the mat')).toEqual(['repair'])
  })

  it("searches a flash's title and its text", () => {
    expect(find('quote sent')).toEqual(['fence'])
    expect(find('offered to paint')).toEqual(['fence'])
    expect(find('£80')).toEqual(['quotes'])
    expect(find('saturday morning')).toEqual(['quotes'])
  })

  it('ignores case', () => {
    expect(find('JORDAN LEE')).toEqual(['booked'])
    expect(find('kitchen TAP')).toEqual(['repair'])
  })

  it('ignores accents, in the text and in the conversation', () => {
    expect(find('chloe')).toEqual(['fence'])
    expect(find('CHLOÉ')).toEqual(['fence'])
    const plain = [thread({ id: 'plain', otherParty: { name: 'Chloe' } })]
    expect(find('chloé', 'all', ME, plain)).toEqual(['plain'])
  })

  it('treats full-width letters as plain ones, in the text and in the conversation', () => {
    expect(find('ＣＨＬＯＥ')).toEqual(['fence'])
    const wide = [
      thread({ id: 'wide', otherParty: { name: 'Ｍｉａ Ｗｏｎｇ' } }),
    ]
    expect(find('mia wong', 'all', ME, wide)).toEqual(['wide'])
  })

  it('needs every word, in any order, each found in the name, title or message', () => {
    expect(find('jordan bookshelf drill')).toEqual(['booked'])
    expect(find('drill jordan')).toEqual(['booked'])
    expect(find('jordan fence')).toEqual([])
  })

  it('collapses the spaces typed', () => {
    expect(find('  bookshelf   jordan ')).toEqual(['booked'])
  })

  it('keeps every conversation for empty or blank text', () => {
    expect(find('')).toEqual(ids(inbox))
    expect(find('   ')).toEqual(ids(inbox))
  })

  it('finds nothing when no conversation has the text', () => {
    expect(find('plumber')).toEqual([])
  })

  it('finds the Slashie thread by its title or its latest announcement', () => {
    expect(find('slashie')).toEqual(['slashie'])
    expect(find('message workers')).toEqual(['slashie'])
  })
})

describe('filterThreads: filter', () => {
  it('All keeps everything', () => {
    expect(find('', 'all')).toEqual(ids(inbox))
  })

  it('Unread keeps the conversations with something unread', () => {
    expect(find('', 'unread')).toEqual(['booked', 'fence'])
  })

  it('Needs you keeps the conversations with an attention, whatever it is', () => {
    expect(find('', 'needsYou')).toEqual(['quotes', 'repair'])
  })

  it('Posted by you keeps the tasks you posted', () => {
    expect(find('', 'posted')).toEqual(['booked', 'quotes'])
  })

  it('Working on keeps the tasks someone else posted', () => {
    expect(find('', 'working')).toEqual(['repair', 'fence'])
  })

  it('Slashie updates keeps the Slashie thread only', () => {
    expect(find('', 'slashie')).toEqual(['slashie'])
  })

  it('puts the Slashie thread on neither side, as it has no task', () => {
    expect(find('', 'posted')).not.toContain('slashie')
    expect(find('', 'working')).not.toContain('slashie')
  })

  it('puts a task with no poster on neither side', () => {
    const unknown = [thread({ id: 'unknown', task: {} })]
    expect(find('', 'posted', ME, unknown)).toEqual([])
    expect(find('', 'working', ME, unknown)).toEqual([])
  })

  it('puts every task on neither side before the signed-in user is known', () => {
    expect(find('', 'posted', null)).toEqual([])
    expect(find('', 'working', null)).toEqual([])
  })
})

describe('filterThreads: search and filter together', () => {
  // "garden" is in two titles: a task I posted, and one I'm quoting on.
  const garden: Record<InboxFilter, string[]> = {
    all: ['quotes', 'fence'],
    unread: ['fence'],
    needsYou: ['quotes'],
    posted: ['quotes'],
    working: ['fence'],
    slashie: [],
  }

  it.each(INBOX_FILTERS)(
    'with %s, the search narrows what it keeps',
    (filter) => {
      expect(find('garden', filter)).toEqual(garden[filter])
    },
  )

  it('finds nothing when the filter keeps none of the matches', () => {
    expect(find('jordan', 'working')).toEqual([])
    expect(find('jordan', 'slashie')).toEqual([])
  })
})

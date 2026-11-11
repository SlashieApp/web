import { describe, expect, it } from 'vitest'

import { getSafeNextPath } from '@/app/(auth)/helpers/authRedirect'

import {
  START_TITLE_MAX_LENGTH,
  createTaskPathWithTitle,
  createTaskStartingTitle,
  createTaskTitleFromQuery,
} from './createTaskStartTitle'

describe('createTaskTitleFromQuery', () => {
  it('reads the title a link carries', () => {
    expect(createTaskTitleFromQuery('?title=Fix+a+leaking+tap')).toBe(
      'Fix a leaking tap',
    )
    expect(createTaskTitleFromQuery('?title=%E4%BF%AE%E7%90%86')).toBe('修理')
  })

  it('is null without a usable title', () => {
    expect(createTaskTitleFromQuery('')).toBeNull()
    expect(createTaskTitleFromQuery('?repost=abc')).toBeNull()
    expect(createTaskTitleFromQuery('?title=')).toBeNull()
    expect(createTaskTitleFromQuery('?title=%20%0A%20')).toBeNull()
  })

  it('keeps it to one tidy line', () => {
    expect(
      createTaskTitleFromQuery('?title=%20Mow%0A%0Athe%20%20%20lawn%09now%20'),
    ).toBe('Mow the lawn now')
    expect(createTaskTitleFromQuery('?title=Mow%00the%1Blawn')).toBe(
      'Mow the lawn',
    )
  })

  it('cuts a long title at the limit', () => {
    const long = 'a'.repeat(START_TITLE_MAX_LENGTH + 40)
    expect(createTaskTitleFromQuery(`?title=${long}`)).toHaveLength(
      START_TITLE_MAX_LENGTH,
    )
  })

  it('leaves markup as plain text for the field', () => {
    expect(
      createTaskTitleFromQuery('?title=%3Cimg%20src%3Dx%20onerror%3D1%3E'),
    ).toBe('<img src=x onerror=1>')
  })
})

describe('createTaskPathWithTitle', () => {
  it('is the bare path when nothing was typed', () => {
    expect(createTaskPathWithTitle('')).toBe('/tasks/create')
    expect(createTaskPathWithTitle('   ')).toBe('/tasks/create')
  })

  it('carries the typed title', () => {
    expect(createTaskPathWithTitle('  Fix a leaking tap ')).toBe(
      '/tasks/create?title=Fix+a+leaking+tap',
    )
  })

  it('round-trips through the reader, symbols included', () => {
    for (const title of [
      'Tap & sink: fix?',
      '修理漏水的水龍頭',
      'a=b#c+d%20',
    ]) {
      const [, search = ''] = createTaskPathWithTitle(title).split('?')
      expect(createTaskTitleFromQuery(`?${search}`)).toBe(title)
    }
  })

  it('survives sign-up as the `next` path', () => {
    const next = createTaskPathWithTitle('Tap & sink: fix?')
    const register = new URL(
      `/register?next=${encodeURIComponent(next)}`,
      'https://slashie.invalid',
    )
    const safe = getSafeNextPath(register.searchParams.get('next'))
    expect(safe).toBe(next)
    expect(createTaskTitleFromQuery(safe?.split('?')[1] ?? '')).toBe(
      'Tap & sink: fix?',
    )
  })
})

describe('createTaskStartingTitle', () => {
  it("keeps a draft's own title", () => {
    expect(createTaskStartingTitle('Paint the fence', 'Fix a tap')).toBe(
      'Paint the fence',
    )
  })

  it('fills a draft that has no title yet', () => {
    expect(createTaskStartingTitle('', 'Fix a tap')).toBe('Fix a tap')
    expect(createTaskStartingTitle('   ', 'Fix a tap')).toBe('Fix a tap')
    expect(createTaskStartingTitle(undefined, 'Fix a tap')).toBe('Fix a tap')
  })

  it('is empty when neither has one', () => {
    expect(createTaskStartingTitle(undefined, '')).toBe('')
  })
})

import { describe, expect, it } from 'vitest'

import {
  clearCreateTaskDraft,
  readCreateTaskDraft,
  saveCreateTaskDraft,
} from './createTaskDraft'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    map,
  }
}

const KEY = 'draft-key'
const NOW = Date.UTC(2026, 9, 16, 12)
const values = {
  title: 'Fix a leaking tap',
  description: '',
  categories: ['Plumbing'],
  streetAddress: '12 Example Street',
  acceptedProhibitedUse: true,
}

describe('create task draft', () => {
  it('has nothing to restore at first', () => {
    expect(readCreateTaskDraft(memoryStorage(), KEY, NOW)).toBeNull()
  })

  it('restores the step, the finished steps and the answers', () => {
    const storage = memoryStorage()
    saveCreateTaskDraft(
      storage,
      KEY,
      { step: 'timing', done: ['location', 'details'], values },
      NOW,
    )
    expect(readCreateTaskDraft(storage, KEY, NOW + 60_000)).toMatchObject({
      step: 'timing',
      done: ['location', 'details'],
      savedAt: NOW,
      values: { title: 'Fix a leaking tap', categories: ['Plumbing'] },
    })
  })

  it('never keeps the allowed-tasks confirmation', () => {
    const storage = memoryStorage()
    saveCreateTaskDraft(storage, KEY, { step: 'review', done: [], values }, NOW)
    expect(readCreateTaskDraft(storage, KEY, NOW)?.values).not.toHaveProperty(
      'acceptedProhibitedUse',
    )
  })

  it('forgets a draft older than a week', () => {
    const storage = memoryStorage()
    saveCreateTaskDraft(
      storage,
      KEY,
      { step: 'details', done: [], values },
      NOW,
    )
    expect(readCreateTaskDraft(storage, KEY, NOW + 8 * 86_400_000)).toBeNull()
  })

  it('saves nothing for an empty form', () => {
    const storage = memoryStorage()
    saveCreateTaskDraft(
      storage,
      KEY,
      {
        step: 'location',
        done: [],
        values: { title: ' ', categories: [], streetAddress: '' },
      },
      NOW,
    )
    expect(storage.map.size).toBe(0)
  })

  it('ignores something that is not a draft', () => {
    const storage = memoryStorage()
    storage.setItem(KEY, '{not json')
    expect(readCreateTaskDraft(storage, KEY, NOW)).toBeNull()
    storage.setItem(KEY, JSON.stringify({ v: 99 }))
    expect(readCreateTaskDraft(storage, KEY, NOW)).toBeNull()
  })

  it('clears after posting', () => {
    const storage = memoryStorage()
    saveCreateTaskDraft(
      storage,
      KEY,
      { step: 'details', done: [], values },
      NOW,
    )
    clearCreateTaskDraft(storage, KEY)
    expect(readCreateTaskDraft(storage, KEY, NOW)).toBeNull()
  })

  it('carries on when storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }
    expect(readCreateTaskDraft(blocked, KEY, NOW)).toBeNull()
    expect(() =>
      saveCreateTaskDraft(
        blocked,
        KEY,
        { step: 'details', done: [], values },
        NOW,
      ),
    ).not.toThrow()
    expect(() => clearCreateTaskDraft(blocked, KEY)).not.toThrow()
  })
})

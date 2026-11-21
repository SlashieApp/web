import { describe, expect, it } from 'vitest'

import {
  POSTED_MOMENT_MAX_AGE_MS,
  markTaskPosted,
  takeTaskPosted,
} from './postedMoment'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, value),
    removeItem: (key: string) => void map.delete(key),
    size: () => map.size,
  }
}

const NOW = 1_800_000_000_000

/** The "Task posted" moment plays once, on the page of the task just posted (Ryan 22 Nov). */
describe('the Task posted moment', () => {
  it('plays once on the posted task’s page, and never again', () => {
    const storage = memoryStorage()
    markTaskPosted(storage, 'task-1', NOW)
    expect(takeTaskPosted(storage, 'task-1', NOW + 800)).toBe(true)
    // A refresh, a later visit, a second tab of the same page.
    expect(takeTaskPosted(storage, 'task-1', NOW + 900)).toBe(false)
    expect(storage.size()).toBe(0)
  })

  it('is for that task only; another task’s page uses the note up', () => {
    const storage = memoryStorage()
    markTaskPosted(storage, 'task-1', NOW)
    expect(takeTaskPosted(storage, 'task-2', NOW)).toBe(false)
    expect(takeTaskPosted(storage, 'task-1', NOW)).toBe(false)
  })

  it('a note for a landing that never happened goes stale', () => {
    const storage = memoryStorage()
    markTaskPosted(storage, 'task-1', NOW)
    expect(
      takeTaskPosted(storage, 'task-1', NOW + POSTED_MOMENT_MAX_AGE_MS + 1),
    ).toBe(false)
    expect(storage.size()).toBe(0)
  })

  it('nothing to take with no note, no store, or a broken one', () => {
    expect(takeTaskPosted(memoryStorage(), 'task-1', NOW)).toBe(false)
    expect(takeTaskPosted(null, 'task-1', NOW)).toBe(false)
    markTaskPosted(null, 'task-1', NOW)
    const broken = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => undefined,
    }
    markTaskPosted(broken, 'task-1', NOW)
    expect(takeTaskPosted(broken, 'task-1', NOW)).toBe(false)
    const junk = memoryStorage()
    junk.setItem('slashie:task-posted', 'not json')
    expect(takeTaskPosted(junk, 'task-1', NOW)).toBe(false)
  })
})

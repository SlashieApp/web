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
  it('a draft from before FE-584: its budget type becomes the unit field', () => {
    for (const [budgetType, budgetUnit] of [
      ['PER_HOUR', 'per hour'],
      ['PER_DAY', 'per day'],
      ['ONE_OFF', ''],
    ]) {
      const storage = memoryStorage()
      storage.setItem(
        KEY,
        JSON.stringify({
          v: 1,
          savedAt: NOW,
          step: 'budget',
          done: ['location'],
          values: { title: 'Paint a fence', budgetMajor: '20', budgetType },
        }),
      )
      const draft = readCreateTaskDraft(storage, KEY, NOW)
      expect(draft?.values).toEqual({
        title: 'Paint a fence',
        budgetMajor: '20',
        budgetUnit,
        // It held an amount, so the budget question reads as answered.
        budgetAnswered: true,
      })
    }
  })

  it('a draft from before the budget question: its answer is what it held', () => {
    const answered = (values: Record<string, unknown>) => {
      const storage = memoryStorage()
      storage.setItem(
        KEY,
        JSON.stringify({
          v: 1,
          savedAt: NOW,
          step: 'budget',
          done: ['location'],
          values: { title: 'Paint a fence', ...values },
        }),
      )
      return readCreateTaskDraft(storage, KEY, NOW)?.values
    }
    // An amount was Set a budget; Skip was Open budget.
    expect(answered({ budgetMajor: '20' })).toMatchObject({
      budgetAnswered: true,
    })
    expect(answered({ openBudget: true })).toMatchObject({
      budgetAnswered: true,
      openBudget: true,
    })
    // Neither: the question is still to be asked.
    expect(answered({ budgetMajor: ' ' })).toMatchObject({
      budgetAnswered: false,
    })
    // A draft saved since keeps its own answer.
    expect(
      answered({ budgetMajor: '20', budgetAnswered: false }),
    ).toMatchObject({ budgetAnswered: false })
  })

  it('a draft from before several payment methods: it keeps the one it held', () => {
    const restored = (values: Record<string, unknown>) => {
      const storage = memoryStorage()
      storage.setItem(
        KEY,
        JSON.stringify({
          v: 1,
          savedAt: NOW,
          step: 'budget',
          done: ['location'],
          values: { title: 'Paint a fence', ...values },
        }),
      )
      return readCreateTaskDraft(storage, KEY, NOW)?.values
    }
    // The single method becomes the list, and the old field is dropped.
    const old = restored({ paymentMethod: 'BANK_TRANSFER' })
    expect(old).toMatchObject({ paymentMethods: ['BANK_TRANSFER'] })
    expect(old).not.toHaveProperty('paymentMethod')
    // Something that is not a method leaves the form's own start (Cash).
    expect(restored({ paymentMethod: 'CHEQUE' })).not.toHaveProperty(
      'paymentMethods',
    )
    expect(restored({ paymentMethod: 7 })).not.toHaveProperty('paymentMethods')
    // A draft with a list keeps it, also an empty one.
    expect(
      restored({ paymentMethod: 'CASH', paymentMethods: ['CARD', 'CASH'] }),
    ).toMatchObject({ paymentMethods: ['CARD', 'CASH'] })
    expect(
      restored({ paymentMethod: 'CASH', paymentMethods: [] }),
    ).toMatchObject({ paymentMethods: [] })
    // A draft saved since has no old field and is left as it is.
    expect(restored({ paymentMethods: ['CARD'] })).toMatchObject({
      paymentMethods: ['CARD'],
    })
  })

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

  it('reopens on the address step with the exact address', () => {
    const storage = memoryStorage()
    saveCreateTaskDraft(
      storage,
      KEY,
      { step: 'address', done: ['location'], values },
      NOW,
    )
    expect(readCreateTaskDraft(storage, KEY, NOW)).toMatchObject({
      step: 'address',
      done: ['location'],
      values: { streetAddress: '12 Example Street' },
    })
  })

  it('reopens on the photos step, without the photos (they are never kept)', () => {
    const storage = memoryStorage()
    const done = ['location', 'address', 'details', 'timing'] as const
    saveCreateTaskDraft(
      storage,
      KEY,
      { step: 'photos', done: [...done], values },
      NOW,
    )
    const draft = readCreateTaskDraft(storage, KEY, NOW)
    expect(draft).toMatchObject({ step: 'photos', done: [...done] })
    expect(Object.keys(draft?.values ?? {})).not.toContain('photos')
  })

  it('ignores a draft on a step the flow no longer has', () => {
    const storage = memoryStorage()
    storage.setItem(
      KEY,
      JSON.stringify({
        v: 1,
        savedAt: NOW,
        step: 'contact',
        done: ['location'],
        values,
      }),
    )
    expect(readCreateTaskDraft(storage, KEY, NOW)).toBeNull()
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

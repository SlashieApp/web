import { Currency } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  STORY_WORKER_ID,
  storyPublicQuote,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from './taskDetailStoryFixtures'
import {
  taskBudgetDisplayLine,
  taskDetailLocationLabel,
  taskDetailMapCoordinates,
} from './taskDetailUtils'

const gbp = (amount: number) => ({ amount, currency: Currency.Gbp })

describe('taskBudgetDisplayLine', () => {
  const task = storyTaskDetail({
    quotes: [
      storyTaskQuote({ id: 'q-1', price: gbp(95) }),
      storyTaskQuote({ id: 'q-2', workerUserId: 'worker-2', price: gbp(85) }),
    ],
  })

  it("gives the owner the quotes' range with an en dash", () => {
    expect(taskBudgetDisplayLine(task, 'owner')).toBe('£85–£95')
    expect(
      taskBudgetDisplayLine(
        storyTaskDetail({ quotes: [storyTaskQuote({ price: gbp(85) })] }),
        'owner',
      ),
    ).toBe('£85')
  })

  it('gives anyone else the budget unless they quoted', () => {
    const others = storyTaskDetail({
      quotes: [storyPublicQuote({ price: gbp(60) })],
    })
    expect(taskBudgetDisplayLine(others, 'visitor')).toBe('£120')
    expect(taskBudgetDisplayLine(others, 'visitor', null)).toBe('£120')
    expect(taskBudgetDisplayLine(others, 'visitor', 'someone-else')).toBe(
      '£120',
    )
    // Their own quote's price once they've quoted.
    expect(taskBudgetDisplayLine(task, 'visitor', STORY_WORKER_ID)).toBe('£95')
  })

  it('falls back to "Open" with no budget and no quotes', () => {
    expect(
      taskBudgetDisplayLine(
        storyTaskDetail({ budget: null, quotes: [] }),
        'owner',
      ),
    ).toBe('Open')
  })
})

describe('where the page draws a task (FE-472)', () => {
  // The API's public point for everyone else; the booked snapshot is exact.
  const task = storyTaskDetail({
    location: {
      lat: 51.5081,
      lng: -0.1269,
      name: 'Westminster',
      address: null,
    },
  })
  const order = storyTaskOrder()

  it('centres on location as the API returned it unless the viewer has the exact location', () => {
    expect(taskDetailMapCoordinates(task, order, false)).toEqual({
      lat: 51.5081,
      lng: -0.1269,
    })
    expect(taskDetailMapCoordinates(task, null, false)).toEqual({
      lat: 51.5081,
      lng: -0.1269,
    })
  })

  it("prefers the booked snapshot's spot only for an exact viewer", () => {
    expect(taskDetailMapCoordinates(task, order, true)).toEqual({
      lat: 51.5074,
      lng: -0.1278,
    })
    expect(taskDetailMapCoordinates(task, null, true)).toEqual({
      lat: 51.5081,
      lng: -0.1269,
    })
  })

  it('never reads an order address for a viewer without the exact location', () => {
    expect(
      taskDetailLocationLabel({
        task,
        myOrder: order,
        showExactLocation: false,
      }),
    ).toBe('Westminster')
    expect(
      taskDetailLocationLabel({
        task,
        myOrder: order,
        showExactLocation: true,
      }),
    ).toBe('12 Example Street, London SW1A 1AA')
  })
})

import { describe, expect, it } from 'vitest'

import {
  createTaskAskingHref,
  parseAskWorkerParam,
  taskPathAfterPost,
  taskPathAsking,
  withoutAskWorkerParam,
} from './askWorkerParam'

const ID = '64b7f0c2a1d3e4f5a6b7c8d9'

describe('askWorker param', () => {
  it('reads a 24-hex worker id', () => {
    expect(parseAskWorkerParam(`?askWorker=${ID}`)).toBe(ID)
    expect(parseAskWorkerParam(`?x=1&askWorker=${ID.toUpperCase()}`)).toBe(
      ID.toUpperCase(),
    )
  })

  it('ignores anything that is not a 24-hex id', () => {
    expect(parseAskWorkerParam('')).toBeNull()
    expect(parseAskWorkerParam('?askWorker=')).toBeNull()
    expect(parseAskWorkerParam('?askWorker=abc')).toBeNull()
    expect(parseAskWorkerParam(`?askWorker=${ID}0`)).toBeNull()
    expect(parseAskWorkerParam(`?askWorker=${ID.replace('6', 'g')}`)).toBeNull()
    expect(parseAskWorkerParam('?askWorker=<script>')).toBeNull()
  })

  it('builds the Post a task link and the task link that carry the worker', () => {
    expect(createTaskAskingHref(ID)).toBe(`/tasks/create?askWorker=${ID}`)
    expect(taskPathAsking('t1', ID)).toBe(`/tasks/t1?askWorker=${ID}`)
  })

  it('after Post a task: the task page, with the worker only when one was carried', () => {
    expect(taskPathAfterPost('t1', null)).toBe('/tasks/t1')
    expect(taskPathAfterPost('t1', ID)).toBe(`/tasks/t1?askWorker=${ID}`)
  })

  it('removes only the param', () => {
    expect(withoutAskWorkerParam(`?askWorker=${ID}`)).toBe('')
    expect(withoutAskWorkerParam(`?from=search&askWorker=${ID}&lat=1`)).toBe(
      '?from=search&lat=1',
    )
    expect(withoutAskWorkerParam('?from=search')).toBe('?from=search')
  })
})

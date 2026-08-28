import { describe, expect, it } from 'vitest'

import { setTaskHandoff, taskHandoffFor, taskVtName } from './taskCardHandoff'

const vm = {
  id: 'task-1',
  title: 'Mount a TV',
  description: 'Need a worker.',
  location: 'Southwark',
  priceLabel: '£120',
  thumbnailSrc: 'https://cdn.example/tv.jpg',
}

describe('taskCardHandoff', () => {
  it('returns the handoff only when the id matches', () => {
    setTaskHandoff(vm)
    expect(taskHandoffFor('task-1')?.title).toBe('Mount a TV')
    expect(taskHandoffFor('task-2')).toBeNull()
  })

  it('scopes view-transition names to the task id', () => {
    expect(taskVtName('img', 'task-1')).toBe('task-img-task-1')
    expect(taskVtName('title', 'task-1')).toBe('task-title-task-1')
    expect(taskVtName('price', 'task-1')).toBe('task-price-task-1')
  })
})

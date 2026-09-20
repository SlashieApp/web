import { describe, expect, it } from 'vitest'

import { setTaskHandoff, taskHandoffFor } from './taskCardHandoff'

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
})

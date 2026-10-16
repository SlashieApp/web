import { TaskStatus } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import {
  EDIT_TASK_VIEWS,
  type EditTaskViewInput,
  type EditTaskViewName,
  getEditTaskView,
} from '.'

type Task = NonNullable<EditTaskViewInput['task']>

const seen = new Set<EditTaskViewName>()
const owned = (over: Partial<Task> = {}): Task => ({
  status: TaskStatus.Open,
  isOwner: true,
  liveQuotes: 0,
  ...over,
})
const view = (input: Partial<EditTaskViewInput> = {}) => {
  const result = getEditTaskView({
    session: 'ready',
    query: 'ready',
    task: owned(),
    ...input,
  })
  seen.add(result)
  return result
}

describe('getEditTaskView', () => {
  it('sends a signed-out visitor to log in first', () => {
    expect(view({ session: 'guest' })).toBe('edit.signIn')
  })

  it('shows the splash while the account or the task loads', () => {
    expect(view({ session: 'loading' })).toBe('edit.loading')
    expect(view({ query: 'loading', task: null })).toBe('edit.loading')
  })

  it('offers Try again when the task could not load', () => {
    expect(view({ query: 'error', task: null })).toBe('edit.loadError')
  })

  it('says the task is not available when there is none', () => {
    expect(view({ task: null })).toBe('edit.notFound')
  })

  it('tells someone else that only the poster can edit', () => {
    expect(view({ task: owned({ isOwner: false }) })).toBe('edit.notOwner')
  })

  it('locks a booked task', () => {
    expect(view({ task: owned({ status: TaskStatus.Awarded }) })).toBe(
      'edit.booked',
    )
  })

  it('offers to post a cancelled task again', () => {
    expect(view({ task: owned({ status: TaskStatus.Cancelled }) })).toBe(
      'edit.cancelled',
    )
  })

  it('opens the form for an open task', () => {
    expect(view()).toBe('edit.open')
    expect(view({ task: owned({ status: TaskStatus.Draft }) })).toBe(
      'edit.open',
    )
  })

  it('warns that workers who quoted are not told about changes', () => {
    expect(view({ task: owned({ liveQuotes: 2 }) })).toBe('edit.openWithQuotes')
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(EDIT_TASK_VIEWS).sort())
  })
})

import { afterAll, describe, expect, it } from 'vitest'

import {
  CREATE_TASK_VIEWS,
  type CreateTaskViewInput,
  type CreateTaskViewName,
  getCreateTaskView,
} from '.'

const seen = new Set<CreateTaskViewName>()
const view = (input: Partial<CreateTaskViewInput> = {}) => {
  const result = getCreateTaskView({
    session: 'ready',
    step: 'location',
    ...input,
  })
  seen.add(result)
  return result
}

describe('getCreateTaskView', () => {
  it('sends a signed-out visitor to log in first', () => {
    expect(view({ session: 'guest' })).toBe('create.signIn')
  })

  it('shows the splash while the account loads', () => {
    expect(view({ session: 'loading' })).toBe('create.loading')
  })

  it('offers Try again when the account could not load', () => {
    expect(view({ session: 'error' })).toBe('create.loadError')
  })

  it('starts on the full-screen map', () => {
    expect(view()).toBe('create.location')
  })

  it('asks what needs doing, with photos, after the map', () => {
    expect(view({ step: 'details' })).toBe('create.details')
  })

  it('asks when the job is needed', () => {
    expect(view({ step: 'timing' })).toBe('create.timing')
  })

  it('asks for the budget', () => {
    expect(view({ step: 'budget' })).toBe('create.budget')
  })

  it('ends on a review of what workers will see, with Post task', () => {
    expect(view({ step: 'review' })).toBe('create.review')
  })

  it('keeps the map full screen only on the location step', () => {
    const steps = Object.values(CREATE_TASK_VIEWS).filter(
      (config) => config.layout === 'step',
    )
    expect(
      steps.filter((config) => config.map === 'full').map((c) => c.step),
    ).toEqual(['location'])
  })

  it('posts only from the review step', () => {
    const posting = Object.values(CREATE_TASK_VIEWS).filter(
      (config) => config.layout === 'step' && config.primary === 'post',
    )
    expect(posting).toEqual([CREATE_TASK_VIEWS['create.review']])
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(CREATE_TASK_VIEWS).sort())
  })
})

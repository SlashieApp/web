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

  it('asks an unverified email to be verified before the first step', () => {
    expect(view({ session: 'unverified' })).toBe('create.verifyEmail')
    expect(CREATE_TASK_VIEWS['create.verifyEmail']).toEqual({
      layout: 'verifyEmail',
    })
  })

  it('starts on the full-screen map', () => {
    expect(view()).toBe('create.location')
  })

  it('asks for the exact address after the map', () => {
    expect(view({ step: 'address' })).toBe('create.address')
  })

  it('asks what needs doing after the address, without the photos', () => {
    expect(view({ step: 'details' })).toBe('create.details')
    expect(CREATE_TASK_VIEWS['create.details']).toMatchObject({
      sections: ['basics'],
      fields: ['title', 'categories', 'description'],
    })
  })

  it('asks when the job is needed', () => {
    expect(view({ step: 'timing' })).toBe('create.timing')
  })

  it('asks for photos on their own step, with nothing to check', () => {
    expect(view({ step: 'photos' })).toBe('create.photos')
    expect(CREATE_TASK_VIEWS['create.photos']).toMatchObject({
      step: 'photos',
      sections: ['photos'],
      fields: [],
      primary: 'continue',
    })
  })

  it('asks for the budget', () => {
    expect(view({ step: 'budget' })).toBe('create.budget')
  })

  it('ends on a review of what workers will see, with Post task', () => {
    expect(view({ step: 'review' })).toBe('create.review')
  })

  it('checks the email once, before the flow, not at the review', () => {
    expect(CREATE_TASK_VIEWS['create.review']).toMatchObject({
      sections: ['summary', 'contact', 'consent'],
    })
  })

  it('keeps the exact address off the map, on its own step under the band', () => {
    expect(CREATE_TASK_VIEWS['create.location']).toMatchObject({
      map: 'full',
      sections: ['location'],
      fields: ['mapPlaceName', 'locationLat', 'locationLng'],
    })
    expect(CREATE_TASK_VIEWS['create.address']).toMatchObject({
      map: 'band',
      sections: ['address'],
      fields: ['streetAddress'],
      primary: 'continue',
    })
  })

  it('keeps the map full screen only on the location step', () => {
    const steps = Object.values(CREATE_TASK_VIEWS).filter(
      (config) => config.layout === 'step',
    )
    expect(
      steps.filter((config) => config.map === 'full').map((c) => c.step),
    ).toEqual(['location'])
  })

  it('gives phones the whole screen for the form from the details step on', () => {
    const steps = Object.values(CREATE_TASK_VIEWS).filter(
      (config) => config.layout === 'step',
    )
    expect(
      steps.filter((config) => config.map === 'band').map((c) => c.step),
    ).toEqual(['address'])
    expect(
      steps.filter((config) => config.map === 'desktopBand').map((c) => c.step),
    ).toEqual(['details', 'timing', 'photos', 'budget', 'review'])
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

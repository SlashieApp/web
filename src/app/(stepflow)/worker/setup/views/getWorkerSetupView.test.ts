import { afterAll, describe, expect, it } from 'vitest'

import {
  WORKER_SETUP_SCREENS,
  WORKER_SETUP_VIEWS,
  type WorkerSetupViewInput,
  type WorkerSetupViewName,
  getWorkerSetupView,
} from '.'

const seen = new Set<WorkerSetupViewName>()
const view = (input: Partial<WorkerSetupViewInput> = {}) => {
  const result = getWorkerSetupView({
    status: 'ready',
    screen: 'about',
    ...input,
  })
  seen.add(result)
  return result
}

describe('getWorkerSetupView', () => {
  it('sends a signed-out visitor to log in first', () => {
    expect(view({ status: 'guest' })).toBe('setup.signIn')
  })

  it('shows the splash while the account or the setup loads', () => {
    expect(view({ status: 'loading' })).toBe('setup.loading')
  })

  it('offers Try again when the setup could not load', () => {
    expect(view({ status: 'error' })).toBe('setup.loadError')
  })

  it('sends an existing worker on without flashing the form', () => {
    expect(view({ status: 'complete', screen: 'work' })).toBe('setup.complete')
  })

  it('starts with name, date of birth and photo', () => {
    expect(view()).toBe('setup.about')
  })

  it('asks about the trade, skills and experience', () => {
    expect(view({ screen: 'work' })).toBe('setup.work')
  })

  it('asks for the headline and bio after the trade, so a headline can be suggested', () => {
    expect(view({ screen: 'profile' })).toBe('setup.profile')
  })

  it('asks where they work', () => {
    expect(view({ screen: 'area' })).toBe('setup.area')
  })

  it('asks them to verify a phone', () => {
    expect(view({ screen: 'phone' })).toBe('setup.phone')
  })

  it('ends on a review of what customers will see', () => {
    expect(view({ screen: 'review' })).toBe('setup.review')
  })

  it('saves every API sub-step on exactly one screen', () => {
    const subSteps = WORKER_SETUP_SCREENS.flatMap((screen) => screen.subSteps)
    expect([...subSteps].sort()).toEqual(
      [
        'area.location',
        'area.travel',
        'profile.bio',
        'profile.details',
        'profile.photo',
        'review.submit',
        'services.experience',
        'services.skills',
        'verify.phone',
        'verify.portfolio',
      ].sort(),
    )
  })

  it('finishes setup only from the review', () => {
    expect(
      WORKER_SETUP_SCREENS.filter((screen) => screen.primary === 'finish').map(
        (screen) => screen.screen,
      ),
    ).toEqual(['review'])
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(WORKER_SETUP_VIEWS).sort())
  })
})

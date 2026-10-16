import { afterAll, describe, expect, it } from 'vitest'

import {
  PROFILE_VIEWS,
  type ProfileView,
  type ProfileViewInput,
  getProfileView,
} from '.'

const ready: ProfileViewInput = {
  hasWorker: true,
  setupComplete: true,
  phoneVerified: true,
  isPrivate: false,
}
const seen = new Set<ProfileView>()
const view = (input: Partial<ProfileViewInput>) => {
  const result = getProfileView({ ...ready, ...input })
  seen.add(result)
  return result
}

describe('getProfileView', () => {
  it('shows a customer their public profile link and the worker invitation', () => {
    expect(view({ hasWorker: false, setupComplete: false })).toBe('customer')
  })

  it('drops the public link for a customer whose profile is private', () => {
    expect(
      view({ hasWorker: false, setupComplete: false, isPrivate: true }),
    ).toBe('customerHidden')
  })

  it('asks a worker with unfinished setup to continue it', () => {
    expect(view({ setupComplete: false })).toBe('workerSetup')
    expect(view({ setupComplete: false, isPrivate: true })).toBe('workerSetup')
  })

  it('treats a finished worker with a private profile as hidden', () => {
    expect(view({ isPrivate: true, phoneVerified: false })).toBe('workerHidden')
  })

  it('asks a finished, public worker to verify their phone', () => {
    expect(view({ phoneVerified: false })).toBe('workerVerifyPhone')
  })

  it('shows a finished, verified, public worker as ready', () => {
    expect(view({})).toBe('workerReady')
  })

  it('links to the public profile only when there is one to open', () => {
    expect(PROFILE_VIEWS.customerHidden.publicLink).toBe(false)
    expect(PROFILE_VIEWS.workerSetup.publicLink).toBe(false)
    expect(PROFILE_VIEWS.workerHidden.publicLink).toBe(false)
    expect(PROFILE_VIEWS.workerReady.publicLink).toBe(true)
  })

  // Every registered view is reached by at least one test above.
  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(PROFILE_VIEWS).sort())
  })
})

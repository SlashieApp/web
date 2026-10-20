import { WorkerPublishState } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import {
  PROFILE_VIEWS,
  type ProfileView,
  type ProfileViewInput,
  getProfileView,
} from '.'

const ready: ProfileViewInput = {
  workerPublishState: WorkerPublishState.Published,
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
    expect(view({ workerPublishState: null })).toBe('customer')
  })

  it('drops the public link for a customer whose profile is private', () => {
    expect(view({ workerPublishState: null, isPrivate: true })).toBe(
      'customerHidden',
    )
  })

  it('asks a worker whose profile is a draft to continue setup', () => {
    expect(view({ workerPublishState: WorkerPublishState.Draft })).toBe(
      'workerSetup',
    )
    expect(
      view({ workerPublishState: WorkerPublishState.Draft, isPrivate: true }),
    ).toBe('workerSetup')
  })

  it('follows the API when it says the worker profile is hidden', () => {
    expect(
      view({
        workerPublishState: WorkerPublishState.Hidden,
        phoneVerified: false,
      }),
    ).toBe('workerHidden')
  })

  it('asks a finished, public worker to verify their phone', () => {
    expect(view({ phoneVerified: false })).toBe('workerVerifyPhone')
  })

  it('shows a finished, verified, public worker as ready', () => {
    expect(view({})).toBe('workerReady')
  })

  it('offers the owner preview of a hidden profile, and no link for a draft', () => {
    expect(PROFILE_VIEWS.customerHidden.publicLink).toBe('preview')
    expect(PROFILE_VIEWS.workerHidden.publicLink).toBe('preview')
    expect(PROFILE_VIEWS.workerSetup.publicLink).toBeNull()
    expect(PROFILE_VIEWS.workerReady.publicLink).toBe('view')
    expect(PROFILE_VIEWS.customer.publicLink).toBe('view')
  })

  // Every registered view is reached by at least one test above.
  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(PROFILE_VIEWS).sort())
  })
})

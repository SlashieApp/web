import { WorkerContactAction } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import {
  PUBLIC_PROFILE_VIEWS,
  type PublicProfileViewInput,
  type PublicProfileViewName,
  getPublicProfileView,
} from '.'

type Profile = NonNullable<PublicProfileViewInput['profile']>

const seen = new Set<PublicProfileViewName>()
const view = (input: Partial<PublicProfileViewInput> = {}) => {
  const result = getPublicProfileView({
    query: 'ready',
    profile: null,
    ...input,
  })
  seen.add(result)
  return result
}
const worker = (
  contact: Profile['contact'],
  isSelf = false,
  isHidden = false,
): Profile => ({
  isSelf,
  isHidden,
  isWorker: true,
  contact,
})
const customer = (isSelf = false, isHidden = false): Profile => ({
  isSelf,
  isHidden,
  isWorker: false,
  contact: null,
})

describe('getPublicProfileView', () => {
  it('shows a skeleton while the profile loads for the first time', () => {
    expect(view({ query: 'loading' })).toBe('loading')
  })

  it('offers Try again when the profile could not load', () => {
    expect(view({ query: 'error' })).toBe('loadError')
  })

  it('shows the empty shell when the API has no public profile', () => {
    expect(view({ profile: null })).toBe('unavailable')
  })

  it('previews your own private profile under a hidden notice', () => {
    expect(view({ profile: worker(null, true, true) })).toBe(
      'worker.ownerHidden',
    )
    expect(view({ profile: customer(true, true) })).toBe('customer.ownerHidden')
  })

  it('asks a signed-out visitor to sign in before contacting a worker', () => {
    expect(view({ profile: worker(null) })).toBe('worker.guest')
  })

  it('treats a sign-in contact action as signed out', () => {
    expect(
      view({
        profile: worker({
          action: WorkerContactAction.SignIn,
          relatedTaskId: null,
        }),
      }),
    ).toBe('worker.guest')
  })

  it('points a signed-in visitor with no quote or job to posting a task', () => {
    expect(
      view({
        profile: worker({
          action: WorkerContactAction.AcceptQuoteFirst,
          relatedTaskId: null,
        }),
      }),
    ).toBe('worker.visitor')
  })

  it('sends you to their quote when the worker quoted on your open task', () => {
    expect(
      view({
        profile: worker({
          action: WorkerContactAction.OpenQuote,
          relatedTaskId: 'task-1',
        }),
      }),
    ).toBe('worker.quoted')
  })

  it('falls back to the visitor view when a quote has no task to open', () => {
    expect(
      view({
        profile: worker({
          action: WorkerContactAction.OpenQuote,
          relatedTaskId: null,
        }),
      }),
    ).toBe('worker.visitor')
  })

  it('sends you to the job when you have a booked job with the worker', () => {
    expect(
      view({
        profile: worker({
          action: WorkerContactAction.OpenTask,
          relatedTaskId: 'task-2',
        }),
      }),
    ).toBe('worker.booked')
  })

  it('shows your own worker profile as the owner preview', () => {
    expect(view({ profile: worker(null, true) })).toBe('worker.owner')
  })

  it('shows the owner preview when the API says contact does not apply', () => {
    expect(
      view({
        profile: worker({
          action: WorkerContactAction.None,
          relatedTaskId: null,
        }),
      }),
    ).toBe('worker.owner')
  })

  it('shows a customer profile the same way to every visitor', () => {
    expect(view({ profile: customer() })).toBe('customer.visitor')
  })

  it('shows your own customer profile as the owner preview', () => {
    expect(view({ profile: customer(true) })).toBe('customer.owner')
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(PUBLIC_PROFILE_VIEWS).sort())
  })
})

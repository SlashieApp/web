import { describe, expect, it } from 'vitest'

import { firstNameOf, shouldPromptAfterPost } from './askAfterPost'

const base = {
  workerId: '64b7f0c2a1d3e4f5a6b7c8d9',
  isOwner: true,
  isOpen: true,
  isSuspended: false,
  canAskToQuote: true,
}

describe('shouldPromptAfterPost', () => {
  it('prompts the owner of an open task when the worker can be asked', () => {
    expect(shouldPromptAfterPost(base)).toBe(true)
  })

  it('never prompts without a carried worker', () => {
    expect(shouldPromptAfterPost({ ...base, workerId: null })).toBe(false)
  })

  it('never prompts anyone but the task owner', () => {
    expect(shouldPromptAfterPost({ ...base, isOwner: false })).toBe(false)
  })

  it('never prompts for a task that is not open or is suspended', () => {
    expect(shouldPromptAfterPost({ ...base, isOpen: false })).toBe(false)
    expect(shouldPromptAfterPost({ ...base, isSuspended: true })).toBe(false)
  })

  it('waits for, and obeys, the worker profile answer', () => {
    expect(shouldPromptAfterPost({ ...base, canAskToQuote: undefined })).toBe(
      false,
    )
    expect(shouldPromptAfterPost({ ...base, canAskToQuote: null })).toBe(false)
    expect(shouldPromptAfterPost({ ...base, canAskToQuote: false })).toBe(false)
  })
})

describe('firstNameOf', () => {
  it('takes the first word and falls back when there is no name', () => {
    expect(firstNameOf('Alex Morgan', 'Slashie member')).toBe('Alex')
    expect(firstNameOf('  ', 'Slashie member')).toBe('Slashie')
    expect(firstNameOf(null, 'Worker')).toBe('Worker')
  })
})

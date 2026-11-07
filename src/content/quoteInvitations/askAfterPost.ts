/**
 * Whether the prompt after Post a task shows (FE-507): the carried worker is a
 * valid id, the viewer owns the task, it is open and not suspended, and the
 * worker's profile says this viewer can ask them. Nothing is sent either way.
 */
export function shouldPromptAfterPost(input: {
  workerId: string | null
  isOwner: boolean
  isOpen: boolean
  isSuspended: boolean
  canAskToQuote: boolean | null | undefined
}): boolean {
  return Boolean(
    input.workerId &&
      input.isOwner &&
      input.isOpen &&
      !input.isSuspended &&
      input.canAskToQuote === true,
  )
}

/** First name for the prompt and toast, or the fallback when the profile has none. */
export function firstNameOf(
  name: string | null | undefined,
  fallback: string,
): string {
  const full = name?.trim() || fallback
  return full.split(/\s+/)[0] || full
}

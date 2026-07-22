/** Max chars accepted from hero/search intent into the create-task draft title. */
export const TASK_DRAFT_TITLE_MAX = 120

/**
 * Build the post-task create path, optionally carrying typed intent as a
 * `title` query param for the create flow to prefill.
 */
export function buildCreateTaskHandoffPath(query: string): string {
  const trimmed = query.trim().slice(0, TASK_DRAFT_TITLE_MAX)
  if (!trimmed) return '/tasks/create'
  return `/tasks/create?title=${encodeURIComponent(trimmed)}`
}

/**
 * Guest handoff: register first, then land on the create flow (with intent).
 */
export function buildRegisterHandoffPath(createPath: string): string {
  return `/register?next=${encodeURIComponent(createPath)}`
}

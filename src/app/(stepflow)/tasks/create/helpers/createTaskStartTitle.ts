/** `/tasks/create?title=`: a task title typed before the form (the landing's hero). */
const START_TITLE_PARAM = 'title'

/**
 * The longest title a link carries. The form itself has no limit; this only
 * stops a link from pushing a wall of text into the field.
 */
export const START_TITLE_MAX_LENGTH = 120

/** One line, single spaces, no control characters, at most the link's limit. */
function tidyStartTitle(value: string): string {
  const line = value
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // Cut by character, so a cut never splits an emoji in two.
  return Array.from(line).slice(0, START_TITLE_MAX_LENGTH).join('').trim()
}

/** The title a link asks the form to start with, or null. */
export function createTaskTitleFromQuery(search: string): string | null {
  const raw = new URLSearchParams(search).get(START_TITLE_PARAM)
  if (!raw) return null
  return tidyStartTitle(raw) || null
}

/** The create-task path that starts the form with `title` (bare when empty). */
export function createTaskPathWithTitle(title: string): string {
  const tidy = tidyStartTitle(title)
  if (!tidy) return '/tasks/create'
  return `/tasks/create?${new URLSearchParams({ [START_TITLE_PARAM]: tidy })}`
}

/**
 * The title the form starts with when a draft is restored: the draft's own
 * (later work wins), else the one the link carries, so a title typed on the
 * landing still fills a draft that has none yet.
 */
export function createTaskStartingTitle(
  draftTitle: string | undefined,
  linkTitle: string,
): string {
  return draftTitle?.trim() ? draftTitle : linkTitle
}

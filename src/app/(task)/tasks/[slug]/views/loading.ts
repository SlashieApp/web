import type { TaskDetailViewConfig } from './types'

/**
 * Viewer-scoped task (and order) still loading: skeleton headline and pill,
 * and the public facts from the listing seed or the public task.
 */
export const loading: TaskDetailViewConfig = {
  pill: null,
  headline: null,
  subline: null,
  facts: ['budget', 'preferredTime', 'location', 'categories', 'description'],
  primaryAction: null,
}

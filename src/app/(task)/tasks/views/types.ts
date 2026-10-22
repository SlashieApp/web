/**
 * What the My Tasks list column shows. `getMyTasksView` picks one; each has a
 * config file in this folder and a row in README.md.
 */
export type MyTasksView =
  | 'loading'
  | 'searching'
  | 'error'
  | 'empty'
  | 'noMatches'
  | 'list'

/** A button under a message (copy: `views.actions`). */
export type MyTasksAction =
  | 'postTask'
  | 'browseTasks'
  | 'retry'
  | 'clearFilters'

export type MyTasksViewConfig = {
  /** The filter button (search and filters); hidden until there's something to search. */
  search: boolean
  /** Card placeholders, a message with buttons, or the sections. */
  body: 'skeleton' | 'message' | 'groups'
  /** The message's copy (`views.<message>`) for `message` bodies. */
  message: 'error' | 'empty' | 'noMatches' | null
  actions: readonly MyTasksAction[]
}

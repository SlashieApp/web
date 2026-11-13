import { empty } from './empty'
import { emptyWorker } from './emptyWorker'
import { error } from './error'
import { list } from './list'
import { loading } from './loading'
import { noMatches } from './noMatches'
import { searching } from './searching'
import type { MyTasksView, MyTasksViewConfig } from './types'

export const MY_TASKS_VIEWS: Record<MyTasksView, MyTasksViewConfig> = {
  loading,
  searching,
  error,
  empty,
  emptyWorker,
  noMatches,
  list,
}

export { getMyTasksView } from './getMyTasksView'
export type { MyTasksViewInput } from './getMyTasksView'
export type { MyTasksAction, MyTasksView, MyTasksViewConfig } from './types'

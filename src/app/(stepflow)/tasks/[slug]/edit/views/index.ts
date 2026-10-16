import { editBooked } from './edit.booked'
import { editCancelled } from './edit.cancelled'
import { editLoadError } from './edit.loadError'
import { editLoading } from './edit.loading'
import { editNotFound } from './edit.notFound'
import { editNotOwner } from './edit.notOwner'
import { editOpen } from './edit.open'
import { editOpenWithQuotes } from './edit.openWithQuotes'
import { editSignIn } from './edit.signIn'
import type { EditTaskViewConfig, EditTaskViewName } from './types'

export { getEditTaskView } from './getEditTaskView'
export type {
  EditTaskStatusAction,
  EditTaskViewConfig,
  EditTaskViewInput,
  EditTaskViewName,
} from './types'

export const EDIT_TASK_VIEWS: Record<EditTaskViewName, EditTaskViewConfig> = {
  'edit.signIn': editSignIn,
  'edit.loading': editLoading,
  'edit.loadError': editLoadError,
  'edit.notFound': editNotFound,
  'edit.notOwner': editNotOwner,
  'edit.booked': editBooked,
  'edit.cancelled': editCancelled,
  'edit.open': editOpen,
  'edit.openWithQuotes': editOpenWithQuotes,
}

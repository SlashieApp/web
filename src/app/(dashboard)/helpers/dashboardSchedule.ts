import { TaskDateTimeType } from '@codegen/schema'

import type { TaskItem } from '@/utils/dashboardHelpers'

export function formatEventTimeLabel(
  task: TaskItem,
  when: Date | null,
): string {
  if (!when) {
    if (task.datetime?.type === TaskDateTimeType.Flexible) return 'Flexible'
    return 'Time TBC'
  }
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(when)
}

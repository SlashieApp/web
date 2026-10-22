'use client'

import { LuHistory } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import {
  TaskActivityLog,
  useTaskActivityLog,
} from '../overview/TaskActivityLog'
import { TaskSectionSheet } from '../ui/TaskSectionSheet'

/**
 * Phones: an Activity section card in Overview (like Analytics) with the
 * latest line as its summary. It opens the whole log in a bottom sheet; web
 * shows the log open in the rail.
 */
export function TaskActivityTrigger() {
  const { task } = useTaskDetail()
  const log = useTaskActivityLog()
  const a = useI11n(bag).activity
  if (!task || !log) return null

  return (
    <TaskSectionSheet
      icon={<LuHistory size={18} />}
      title={a.heading}
      summary={log.loading ? undefined : (log.lines.at(-1)?.text ?? a.empty)}
    >
      <TaskActivityLog {...log} />
    </TaskSectionSheet>
  )
}

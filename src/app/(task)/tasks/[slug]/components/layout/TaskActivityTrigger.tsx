'use client'

import { LuHistory } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import bag from '../../i11n.json'
import {
  ActivitySteps,
  useActivitySteps,
} from '../overview/TaskActivitySections'
import { TaskSectionSheet } from '../ui/TaskSectionSheet'

/**
 * Phones: an Activity section card in Overview (like Analytics) that opens
 * the lifecycle strip in a bottom sheet. Web shows it open in the rail.
 */
export function TaskActivityTrigger() {
  const steps = useActivitySteps()
  const t = useI11n(bag)
  if (!steps) return null
  const current = steps.find((step) => step.current) ?? steps.at(-1)

  return (
    <TaskSectionSheet
      icon={<LuHistory size={18} />}
      title={t.activity.heading}
      summary={current?.label}
    >
      <ActivitySteps steps={steps} />
    </TaskSectionSheet>
  )
}

'use client'

import type { UiBadgeProps, UiBadgeVariant } from '../Badge'
import { Badge } from '../Badge'

import type { ScheduleChip as ScheduleChipValue } from '@/utils/taskJobSchedule'

/**
 * SDL ScheduleChip. Renders a task's relative schedule (today / tomorrow /
 * overdue) as an SDL status pill.
 *
 * Built on the SDL `Badge` so it inherits semantic status roles
 * (`status.<family>.soft|fg|solid`), the green-ink rule, the visible focus
 * ring, and `sdlMotion` transitions — no primitives or raw hex live here.
 *
 * Status is never signalled by colour alone: every chip renders a leading
 * status dot + label (via the Badge `dot` prop), defaulting to `dot` on.
 */
type ScheduleChipKey = NonNullable<ScheduleChipValue>

const CHIP_LABEL: Record<ScheduleChipKey, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  overdue: 'Overdue',
}

/** today → success (green), tomorrow → info (blue), overdue → danger (red). */
const CHIP_VARIANT: Record<ScheduleChipKey, UiBadgeVariant> = {
  today: 'success',
  tomorrow: 'info',
  overdue: 'danger',
}

export type ScheduleChipProps = {
  chip: ScheduleChipValue
} & Omit<UiBadgeProps, 'children' | 'variant'>

export function ScheduleChip({
  chip,
  dot = true,
  ...props
}: ScheduleChipProps) {
  if (!chip) return null
  return (
    <Badge variant={CHIP_VARIANT[chip]} dot={dot} {...props}>
      {CHIP_LABEL[chip]}
    </Badge>
  )
}

'use client'

import type { UiBadgeProps } from '../Badge'
import { Badge } from '../Badge'

import type { ScheduleChip as ScheduleChipValue } from '@/utils/taskJobSchedule'

const CHIP_LABEL: Record<NonNullable<ScheduleChipValue>, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  overdue: 'Overdue',
}

const CHIP_PALETTE: Record<
  NonNullable<ScheduleChipValue>,
  { bg: string; color: string }
> = {
  today: { bg: 'primary.100', color: 'primary.800' },
  tomorrow: { bg: 'secondary.100', color: 'secondary.800' },
  overdue: { bg: 'red.100', color: 'red.800' },
}

export type ScheduleChipProps = {
  chip: ScheduleChipValue
} & Omit<UiBadgeProps, 'children'>

export function ScheduleChip({ chip, ...props }: ScheduleChipProps) {
  if (!chip) return null
  const palette = CHIP_PALETTE[chip]
  return (
    <Badge bg={palette.bg} color={palette.color} {...props}>
      {CHIP_LABEL[chip]}
    </Badge>
  )
}

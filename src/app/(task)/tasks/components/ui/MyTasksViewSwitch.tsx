'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useCallback } from 'react'
import { LuChartNoAxesColumn, LuList } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { IconButton } from '@ui'

import bag from '../../i11n.json'

export type MyTasksMobileView = 'tasks' | 'achievements'

export type MyTasksViewSwitchProps = {
  view: MyTasksMobileView
  onChange: (view: MyTasksMobileView) => void
}

/**
 * Compact corner control. Desktop keeps the achievements rail visible, so
 * this switch is hidden from `lg` up.
 */
export function MyTasksViewSwitch({ view, onChange }: MyTasksViewSwitchProps) {
  const t = useI11n(bag)
  const tasksSelected = view === 'tasks'
  const showTasks = useCallback(() => {
    onChange('tasks')
  }, [onChange])
  const showAchievements = useCallback(() => {
    onChange('achievements')
  }, [onChange])
  return (
    <Box
      as="fieldset"
      borderWidth={0}
      p={0}
      m={0}
      minW={0}
      display={{ base: 'flex', lg: 'none' }}
      flexShrink={0}
    >
      <Box as="legend" srOnly>
        {t.achievements.switchLabel}
      </Box>
      <HStack gap={1}>
        <IconButton
          type="button"
          aria-label={t.achievements.tasksTab}
          aria-pressed={tasksSelected}
          bg={tasksSelected ? 'status.success.soft' : 'transparent'}
          color={tasksSelected ? 'status.success.fg' : 'text.muted'}
          onClick={showTasks}
        >
          <LuList size={18} />
        </IconButton>
        <IconButton
          type="button"
          aria-label={t.achievements.open}
          aria-pressed={!tasksSelected}
          bg={tasksSelected ? 'transparent' : 'status.success.soft'}
          color={tasksSelected ? 'text.muted' : 'status.success.fg'}
          onClick={showAchievements}
        >
          <LuChartNoAxesColumn size={18} />
        </IconButton>
      </HStack>
    </Box>
  )
}

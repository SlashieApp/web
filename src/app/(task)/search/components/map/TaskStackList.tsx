'use client'

import { Stack, Text, chakra } from '@chakra-ui/react'
import { type ReactNode, useEffect, useRef } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlPressActiveCss, sdlTransitionWithPress } from '@/theme/styles'
import { Drawer } from '@ui'

import type { TaskMapStack, TaskMapTask } from '../../../components/ui/TaskMap'
import bag from './i11n.json'

const CARD_W = 288
const CARD_GAP_PX = 32

type TaskStackListProps = {
  stack: TaskMapStack | null
  /** Current map tasks; ids no longer in the list (filters changed) drop out. */
  tasks: readonly TaskMapTask[]
  isDesktop: boolean
  onSelect: (taskId: string) => void
  onClose: () => void
}

/**
 * Tasks at one spot that never split into pins (FE-200): a bottom sheet on
 * mobile, a small card at the cluster on desktop. A row opens the task, the
 * same as tapping its pin.
 */
export function TaskStackList({
  stack,
  tasks,
  isDesktop,
  onSelect,
  onClose,
}: TaskStackListProps) {
  const copy = useI11n(bag)
  const rows = stack
    ? stack.taskIds.flatMap((id) => tasks.find((task) => task.id === id) ?? [])
    : []
  const title = formatMessage(copy.stackTitle, { count: rows.length })

  const list = (
    <Stack as="ul" gap={1} m={0} p={0} listStyleType="none">
      {rows.map((task) => (
        <li key={task.id}>
          <chakra.button
            type="button"
            w="full"
            textAlign="left"
            px={3}
            py={2.5}
            borderRadius="md"
            cursor="pointer"
            _hover={{ bg: 'bg.subtle' }}
            css={{
              ...sdlTransitionWithPress('background-color'),
              ...sdlPressActiveCss(),
            }}
            onClick={() => {
              onClose()
              onSelect(task.id)
            }}
          >
            <Text fontWeight={700} color="text.default" lineClamp={1}>
              {task.title}
            </Text>
            <Text fontSize="sm" color="text.muted" lineClamp={1}>
              {[task.priceLabel, task.location].filter(Boolean).join(' · ')}
            </Text>
          </chakra.button>
        </li>
      ))}
    </Stack>
  )

  if (!isDesktop) {
    return (
      <Drawer
        open={rows.length > 0}
        onOpenChange={(next) => {
          if (!next) onClose()
        }}
        title={title}
        placement="bottom"
      >
        {list}
      </Drawer>
    )
  }

  if (!stack || rows.length === 0) return null
  return (
    <StackCard
      key={`${stack.x},${stack.y}`}
      x={stack.x}
      y={stack.y}
      title={title}
      onClose={onClose}
    >
      {list}
    </StackCard>
  )
}

/** Desktop card above (or below, near the top) the cluster; Esc or an outside press closes it. */
function StackCard({
  x,
  y,
  title,
  onClose,
  children,
}: {
  x: number
  y: number
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    ref.current?.querySelector('button')?.focus()
  }, [])

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const half = CARD_W / 2 + 16
  const left = Math.min(Math.max(x, half), window.innerWidth - half)
  const above = y > 340

  return (
    <chakra.dialog
      ref={ref}
      open
      aria-label={title}
      position="fixed"
      left={`${left}px`}
      top={`${y}px`}
      right="auto"
      bottom="auto"
      m={0}
      color="text.default"
      transform={
        above
          ? `translate(-50%, calc(-100% - ${CARD_GAP_PX}px))`
          : `translate(-50%, ${CARD_GAP_PX}px)`
      }
      w={`${CARD_W}px`}
      maxH="320px"
      overflowY="auto"
      p={2}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      boxShadow="lg"
      zIndex="popover"
    >
      <Text px={3} pt={1} pb={2} fontSize="sm" fontWeight={700}>
        {title}
      </Text>
      {children}
    </chakra.dialog>
  )
}

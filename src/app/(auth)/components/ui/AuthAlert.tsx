'use client'

import { HStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuCircleAlert, LuCircleCheck, LuInfo } from 'react-icons/lu'

export type AuthAlertTone = 'danger' | 'success' | 'info'

const TONE = {
  danger: {
    color: 'status.danger.fg',
    bg: 'status.danger.soft',
    Icon: LuCircleAlert,
  },
  success: {
    color: 'status.success.fg',
    bg: 'status.success.soft',
    Icon: LuCircleCheck,
  },
  info: { color: 'status.warning.fg', bg: 'status.warning.soft', Icon: LuInfo },
} as const

/**
 * One line of feedback in an auth form: what went wrong, what was sent, or
 * an account notice. Errors are announced at once (`role="alert"`).
 */
export function AuthAlert({
  tone = 'danger',
  children,
}: {
  tone?: AuthAlertTone
  children: ReactNode
}) {
  const { color, bg, Icon } = TONE[tone]
  return (
    <HStack
      role={tone === 'danger' ? 'alert' : 'status'}
      align="flex-start"
      gap={2.5}
      p={3}
      borderRadius="md"
      bg={bg}
      color={color}
    >
      <Icon size={18} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
      <Text fontSize="sm" fontWeight={500} lineHeight="1.5">
        {children}
      </Text>
    </HStack>
  )
}

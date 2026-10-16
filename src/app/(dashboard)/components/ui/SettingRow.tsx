'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/** Lines between rows in a settings card. */
export const SETTING_ROW_DIVIDERS = {
  '& > * + *': { borderTopWidth: '1px', borderColor: 'border.default' },
} as const

export type SettingRowProps = {
  label: string
  /** One line under the label. */
  description?: ReactNode
  /** The row's control or action, on the right. */
  children?: ReactNode
}

/** A settings row: label and one line on the left, its control on the right. */
export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <HStack
      justify="space-between"
      align="center"
      gap={4}
      py={3}
      minH="56px"
      flexWrap="wrap"
    >
      <Stack gap={0} flex="1" minW="12rem">
        <Text fontSize="sm" fontWeight={700} color="text.default">
          {label}
        </Text>
        {description ? (
          <Text as="div" fontSize="xs" color="text.muted">
            {description}
          </Text>
        ) : null}
      </Stack>
      {children}
    </HStack>
  )
}

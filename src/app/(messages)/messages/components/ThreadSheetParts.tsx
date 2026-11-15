'use client'

import { Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/**
 * The thread drawers' pieces (FE-569), in the quote drawer's language: flat,
 * no cards. A section is a muted label over its content; the actions are
 * full-width buttons stacked at the foot of the drawer.
 */

/** A labelled section: "When", "Payment", "Times offered", "Message". */
export function SheetSection({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Stack gap={2}>
      <Text textStyle="label-md" color="text.muted">
        {label}
      </Text>
      {children}
    </Stack>
  )
}

/**
 * The drawer's actions at its foot: full width, the main one first, 12
 * apart. Renders nothing when no action applies.
 */
export function SheetActions({ children }: { children: ReactNode }) {
  return (
    <Stack
      data-sheet-actions=""
      gap={3}
      w="full"
      css={{ '&:empty': { display: 'none' } }}
    >
      {children}
    </Stack>
  )
}

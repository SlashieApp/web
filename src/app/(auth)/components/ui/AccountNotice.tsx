import { Box, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/**
 * A notice about your account under the header (FE-541): the suspended
 * account and the unverified email share this one look. A 16px side inset,
 * the text left-aligned, the amber notice colours, and any actions on a row
 * under the text, so every notice starts on the same left edge.
 */
export function AccountNotice({
  announce,
  ariaLabel,
  children,
  actions,
  ...dataAttrs
}: {
  /** How a screen reader hears it: `alert` interrupts (suspended), `status` waits. */
  announce: 'alert' | 'status'
  ariaLabel: string
  /** The notice itself: one short sentence. */
  children: ReactNode
  /** Links and buttons, on a row under the text. */
  actions?: ReactNode
} & Record<`data-${string}`, string>) {
  return (
    <Box
      role={announce}
      aria-label={ariaLabel}
      bg="status.warning.soft"
      borderBottomWidth="1px"
      borderColor="status.warning.solid"
      px={4}
      py={2.5}
      {...dataAttrs}
    >
      <Stack gap={2} align="flex-start">
        <Box
          fontSize="sm"
          color="status.warning.fg"
          fontWeight={500}
          lineHeight="tall"
          textAlign="left"
        >
          {children}
        </Box>
        {actions ? (
          <Stack
            direction="row"
            gap={3}
            flexWrap="wrap"
            align="center"
            data-notice-actions=""
          >
            {actions}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  )
}

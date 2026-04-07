'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

export type TaskBrowseFloatingPanelProps = StackProps

export function TaskBrowseFloatingPanel({
  children,
  ...rest
}: TaskBrowseFloatingPanelProps) {
  return (
    <Stack
      gap={0}
      bg="surfaceContainerLowest/92"
      borderRadius="2xl"
      boxShadow="0 8px 40px rgba(15,23,42,0.18)"
      borderWidth="1px"
      borderColor="border"
      overflow="hidden"
      {...rest}
    >
      {children}
    </Stack>
  )
}

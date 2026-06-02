'use client'

import { Stack, type StackProps, useBreakpointValue } from '@chakra-ui/react'

import { SectionCard } from '@ui'

import { VisitorMeta } from './VisitorMeta'

/** Sidebar task meta (map + detail list). Hidden below `xl`; main column shows that summary + map instead. */
export function MetaSection(props: StackProps) {
  const showSidebarMeta =
    useBreakpointValue({ base: false, xl: true }, { fallback: 'base' }) ?? false

  if (!showSidebarMeta) return null

  return (
    <Stack gap={4} w="full" {...props}>
      <VisitorMeta />
    </Stack>
  )
}

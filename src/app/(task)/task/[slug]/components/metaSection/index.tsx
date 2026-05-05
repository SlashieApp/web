'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { SectionCard } from '@ui'

import { VisitorMeta } from './VisitorMeta'

export function MetaSection(props: StackProps) {
  return (
    <Stack gap={4} w="full" {...props}>
      <SectionCard eyebrow="Details">
        <VisitorMeta />
      </SectionCard>
    </Stack>
  )
}

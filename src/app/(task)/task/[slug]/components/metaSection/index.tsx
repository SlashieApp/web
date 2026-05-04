'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { SectionCard } from '@ui'

import { IntroText } from './IntroText'
import { VisitorMeta } from './VisitorMeta'

export function MetaSection(props: StackProps) {
  return (
    <Stack gap={4} w="full" {...props}>
      <SectionCard eyebrow="Overview">
        <IntroText />
      </SectionCard>
      <SectionCard eyebrow="Details">
        <VisitorMeta />
      </SectionCard>
    </Stack>
  )
}

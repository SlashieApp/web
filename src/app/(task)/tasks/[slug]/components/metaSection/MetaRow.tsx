'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Text } from '@chakra-ui/react'

/** Label style aligned with `Card` eyebrow and filter section titles. */
export const metaSectionLabelProps = {
  fontSize: 'xs',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'text.muted',
}

type MetaRowListProps = {
  children: ReactNode
  /** List layout: vertical padding and optional bottom divider. */
  withDivider: boolean
  label?: never
  icon?: never
  secondaryLine?: never
}

type MetaRowLabeledProps = {
  label: string
  children: ReactNode
  icon: ReactNode
  /** Muted subline under the value (e.g. distance). */
  secondaryLine?: string
  /** List layout: vertical padding and optional bottom divider. Omit outside stacked lists. */
  withDivider?: boolean
}

export type MetaRowProps = MetaRowListProps | MetaRowLabeledProps

function MetaRowListShell({
  children,
  withDivider,
}: {
  children: ReactNode
  withDivider: boolean
}) {
  return (
    <Box
      py={4}
      borderBottomWidth={withDivider ? '1px' : '0'}
      borderColor="border.default"
    >
      {children}
    </Box>
  )
}

export function MetaRow(props: MetaRowProps) {
  const { children, withDivider } = props

  if (!('label' in props) || props.label == null) {
    return (
      <MetaRowListShell withDivider={withDivider ?? false}>
        {children}
      </MetaRowListShell>
    )
  }

  const { label, icon, secondaryLine } = props

  const row = (
    <HStack align="flex-start" gap={3}>
      <Box flexShrink={0} color="text.muted" mt={0.5} aria-hidden>
        {icon}
      </Box>
      <Box flex={1} minW={0}>
        <Text {...metaSectionLabelProps} mb={1}>
          {label}
        </Text>
        <Box
          fontSize="sm"
          fontWeight={700}
          color="text.default"
          lineHeight="short"
        >
          {children}
        </Box>
        {secondaryLine ? (
          <Text fontSize="xs" color="text.muted" lineHeight="short" mt={1.5}>
            {secondaryLine}
          </Text>
        ) : null}
      </Box>
    </HStack>
  )

  if (withDivider === undefined) {
    return row
  }

  return <MetaRowListShell withDivider={withDivider}>{row}</MetaRowListShell>
}

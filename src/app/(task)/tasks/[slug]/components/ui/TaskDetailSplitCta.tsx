'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Button, Link } from '@ui'

export type TaskDetailSplitCtaProps = {
  eyebrow: string
  /** Headline figure (e.g. `£500`). */
  value: ReactNode
  /** Muted line beside the value (e.g. `Fixed price · Cash`). */
  meta?: ReactNode
  /** Right half. Omit to render the text half alone. */
  action?: { href: string; label: string }
  /** Stretch to the container (compact pin). */
  fullWidth?: boolean
}

/**
 * Two-part main CTA: a white text half joined to the primary action, read
 * as one control. Used when the pricing card is the main CTA.
 */
export function TaskDetailSplitCta({
  eyebrow,
  value,
  meta,
  action,
  fullWidth = false,
}: TaskDetailSplitCtaProps) {
  return (
    <HStack
      gap={0}
      align="stretch"
      w={fullWidth ? 'full' : 'fit-content'}
      maxW="full"
      minW={0}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      boxShadow="e3"
      overflow="hidden"
    >
      <Stack
        gap={0.5}
        flex="1 1 auto"
        minW={0}
        px={4}
        py={2.5}
        justify="center"
      >
        <Text
          fontSize="xs"
          fontWeight={500}
          color="text.muted"
          letterSpacing="0.06em"
          textTransform="uppercase"
          lineHeight="short"
        >
          {eyebrow}
        </Text>
        <HStack
          columnGap={2}
          rowGap={0}
          align="baseline"
          flexWrap="wrap"
          minW={0}
        >
          <Text
            fontSize="lg"
            fontWeight={700}
            color="text.default"
            lineHeight="short"
            flexShrink={0}
          >
            {value}
          </Text>
          {meta ? (
            <Text
              fontSize="sm"
              color="text.muted"
              lineHeight="short"
              whiteSpace="nowrap"
            >
              {meta}
            </Text>
          ) : null}
        </HStack>
      </Stack>
      {action ? (
        <Box display="flex" flexShrink={0}>
          <Button
            asChild
            variant="primary"
            h="auto"
            minH="full"
            px={5}
            borderRadius={0}
          >
            <Link href={action.href} _hover={{ textDecoration: 'none' }}>
              {action.label}
            </Link>
          </Button>
        </Box>
      ) : null}
    </HStack>
  )
}

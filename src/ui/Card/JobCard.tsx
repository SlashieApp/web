'use client'

import {
  Box,
  type BoxProps,
  Center,
  HStack,
  Heading,
  Image,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Badge } from '../Badge/Badge'

function TradeCategoryIcon() {
  return (
    <Box as="span" w="26px" h="26px" display="inline-flex" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Trade</title>
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l1.9-1.9a4 4 0 0 1 2 6.9l-6.4 6.4a2.83 2.83 0 1 1-4-4l4.2-4.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 20l5-5M6.5 11.5L11 7M8 5l2 2M5 8l2 2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export type JobCardResponder = {
  src?: string | null
  name?: string
}

export type JobCardProps = Omit<BoxProps, 'children' | 'title'> & {
  title: ReactNode
  description: ReactNode
  /** Shown in metadata badge (uppercased by `Badge`). */
  postedAgo: string
  /** e.g. `$120 Est.` */
  estimate: ReactNode
  /** Up to two faces shown; use `extraResponderCount` for `+N`. */
  responders?: JobCardResponder[]
  extraResponderCount?: number
  /** Leading tile; defaults to trade / wrench-hammer mark. */
  categoryIcon?: ReactNode
}

/** Marketplace task card; colors come from `jobCard*` semantic tokens in `theme/system.ts` (light + dark systems). */
export function JobCard({
  title,
  description,
  postedAgo,
  estimate,
  responders = [],
  extraResponderCount = 0,
  categoryIcon,
  ...rest
}: JobCardProps) {
  const faces = responders.slice(0, 2)
  const showOverflow = extraResponderCount > 0

  return (
    <Box
      borderRadius="24px"
      bg="jobCardBg"
      borderWidth="1px"
      borderColor="jobCardBorder"
      p={6}
      maxW="md"
      w="full"
      {...rest}
    >
      <HStack justify="space-between" align="flex-start" gap={4} mb={5}>
        <Center
          w={12}
          h={12}
          borderRadius="lg"
          bg="jobCardIconPodBg"
          color="jobCardIconPodColor"
          flexShrink={0}
        >
          {categoryIcon ?? <TradeCategoryIcon />}
        </Center>
        <Badge flexShrink={0}>{postedAgo}</Badge>
      </HStack>

      <Heading
        as="h3"
        fontSize="xl"
        fontWeight={700}
        fontFamily="heading"
        color="jobCardTitle"
        lineHeight="short"
        mb={3}
      >
        {title}
      </Heading>

      <Text
        fontSize="sm"
        color="jobCardDescription"
        lineHeight="tall"
        mb={6}
        fontFamily="body"
      >
        {description}
      </Text>

      <Box h="1px" w="full" bg="jobCardDivider" mb={4} />

      <HStack justify="space-between" align="center" gap={4}>
        <HStack gap={0} align="center">
          {faces.map((r, i) => (
            <Box
              key={`${r.src ?? r.name ?? i}-${i}`}
              w={10}
              h={10}
              borderRadius="full"
              border="2px solid"
              borderColor="jobCardBg"
              ml={i === 0 ? 0 : -2.5}
              zIndex={i}
              overflow="hidden"
              bg="jobCardAvatarEmpty"
              flexShrink={0}
            >
              {r.src ? (
                <Image
                  src={r.src}
                  alt={r.name ?? ''}
                  w="full"
                  h="full"
                  objectFit="cover"
                />
              ) : (
                <Center w="full" h="full" fontSize="xs" fontWeight={600}>
                  {r.name?.slice(0, 1).toUpperCase() ?? '?'}
                </Center>
              )}
            </Box>
          ))}
          {showOverflow ? (
            <Center
              w={10}
              h={10}
              borderRadius="full"
              border="2px solid"
              borderColor="jobCardBg"
              ml={faces.length ? -2.5 : 0}
              zIndex={faces.length}
              bg="jobCardAvatarMore"
              flexShrink={0}
            >
              <Text fontSize="xs" fontWeight={700} color="jobCardOverflowText">
                +{extraResponderCount}
              </Text>
            </Center>
          ) : null}
        </HStack>

        <Text
          fontSize="lg"
          fontWeight={800}
          fontFamily="heading"
          color="jobCardEstimate"
          flexShrink={0}
        >
          {estimate}
        </Text>
      </HStack>
    </Box>
  )
}

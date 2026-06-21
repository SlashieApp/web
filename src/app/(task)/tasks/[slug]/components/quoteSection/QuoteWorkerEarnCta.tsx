'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuArrowRight, LuBriefcase } from 'react-icons/lu'

import { Button, Link } from '@ui'

export type QuoteWorkerEarnCtaProps = {
  createProfileHref?: string
  learnHref?: string
}

export function QuoteWorkerEarnCta({
  createProfileHref = '/worker/setup',
  learnHref = '/pricing',
}: QuoteWorkerEarnCtaProps) {
  return (
    <Box
      bg="primary.50"
      borderRadius="xl"
      borderWidth="1px"
      borderColor="primary.100"
      p={{ base: 4, md: 5 }}
      w="full"
    >
      <HStack align="flex-start" gap={3} w="full">
        <Box
          flexShrink={0}
          boxSize="44px"
          borderRadius="full"
          bg="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="primary.600"
          boxShadow="sm"
          aria-hidden
        >
          <LuBriefcase size={22} strokeWidth={2} />
        </Box>
        <Stack gap={3} flex={1} minW={0} align="stretch">
          <Stack gap={1}>
            <Text
              fontSize="sm"
              fontWeight={700}
              color="cardFg"
              lineHeight="short"
            >
              Want to earn on this job?
            </Text>
            <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
              Create your worker profile to send a quote and get paid directly
              by the customer.
            </Text>
            <Text fontSize="xs" color="formLabelMuted">
              Free to join · Takes ~2 minutes
            </Text>
          </Stack>
          <Link href={createProfileHref} _hover={{ textDecoration: 'none' }}>
            <Button w="full" size="sm">
              Create worker profile
            </Button>
          </Link>
          <Link
            href={learnHref}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            fontSize="sm"
            fontWeight={600}
            color="primary.700"
            tone="emphasis"
          >
            Learn how quoting works
            <LuArrowRight size={16} aria-hidden />
          </Link>
        </Stack>
      </HStack>
    </Box>
  )
}

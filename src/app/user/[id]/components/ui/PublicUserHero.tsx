'use client'

import {
  Box,
  Container,
  Heading,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'

import { Avatar, Button, Link } from '@ui'

type PublicUserHeroProps = {
  pending?: boolean
  name?: string
  avatarUrl?: string | null
  memberSinceLabel?: string | null
  workerHref?: string | null
  workerCtaLabel?: string
}

/** Public identity: avatar, display name, membership, optional worker CTA. */
export function PublicUserHero({
  pending = false,
  name = '',
  avatarUrl,
  memberSinceLabel,
  workerHref,
  workerCtaLabel,
}: PublicUserHeroProps) {
  return (
    <Box
      w="full"
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      bgImage="linear-gradient(180deg, var(--chakra-colors-status-success-soft) 0%, var(--chakra-colors-bg-surface) 78%)"
    >
      <Container py={{ base: 8, md: 10 }}>
        {pending ? (
          <Stack
            direction={{ base: 'column', md: 'row' }}
            align="center"
            gap={{ base: 4, md: 6 }}
            aria-busy
          >
            <Skeleton boxSize="96px" borderRadius="full" flexShrink={0} />
            <Stack
              gap={3}
              align={{ base: 'center', md: 'flex-start' }}
              flex={1}
              w="full"
            >
              <Skeleton h="2rem" w={{ base: '60%', md: '240px' }} />
              <Skeleton h="1rem" w={{ base: '45%', md: '160px' }} />
            </Stack>
          </Stack>
        ) : (
          <Stack
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'center', md: 'center' }}
            gap={{ base: 4, md: 6 }}
            textAlign={{ base: 'center', md: 'start' }}
          >
            <Avatar
              name={name}
              src={avatarUrl?.trim() || undefined}
              size="xl"
            />
            <Stack
              gap={2}
              align={{ base: 'center', md: 'flex-start' }}
              minW={0}
            >
              <Heading size="2xl" color="text.default" lineHeight="short">
                {name}
              </Heading>
              {memberSinceLabel ? (
                <Text color="text.muted" fontSize="md">
                  {memberSinceLabel}
                </Text>
              ) : null}
              {workerHref && workerCtaLabel ? (
                <Button asChild variant="secondary" size="sm" mt={1}>
                  <Link href={workerHref} _hover={{ textDecoration: 'none' }}>
                    {workerCtaLabel}
                  </Link>
                </Button>
              ) : null}
            </Stack>
          </Stack>
        )}
      </Container>
    </Box>
  )
}

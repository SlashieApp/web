'use client'

import { Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { Button, Card, Link, StatusCard } from '@ui'

import bag from '../../i11n.json'
import type { PublicProfileStatusConfig } from '../../views'

/**
 * Error and unavailable profiles: the shared centred StatusCard (R6, 448). The
 * copy never carries account data.
 */
export function PublicProfileStatus({
  config,
  onRetry,
}: {
  config: PublicProfileStatusConfig
  /** Without it, the error screen has no button. */
  onRetry?: () => void
}) {
  const t = useI11n(bag).status
  const copy = t[config.copy]
  const label = t.actions[config.action]

  return (
    <StatusCard
      title={copy.title}
      body={copy.body}
      actions={
        config.action === 'retry' ? (
          onRetry ? (
            <Button type="button" size="form" onClick={onRetry}>
              {label}
            </Button>
          ) : null
        ) : (
          <Button asChild size="form" variant="secondary">
            <Link href={APP_HOME} _hover={{ textDecoration: 'none' }}>
              {label}
            </Link>
          </Button>
        )
      }
    />
  )
}

/** First load: the hero and two sections in outline. */
export function PublicProfileSkeleton() {
  const t = useI11n(bag).status
  return (
    <Stack gap={{ base: 4, md: 6 }} aria-busy="true">
      <Text srOnly>{t.loading}</Text>
      <Card p={0} overflow="hidden" maxW="full">
        <Skeleton h={{ base: '104px', md: '120px' }} borderRadius={0} />
        <Stack gap={3} px={{ base: 4, md: 6 }} pb={{ base: 4, md: 5 }}>
          <SkeletonCircle size="106px" mt={{ base: '-40px', md: '-60px' }} />
          <Skeleton h="28px" w="55%" borderRadius="md" />
          <Skeleton h="16px" w="40%" borderRadius="md" />
          <Skeleton h="16px" w="30%" borderRadius="md" />
        </Stack>
      </Card>
      <Skeleton h="140px" borderRadius="xl" />
      <Skeleton h="200px" borderRadius="xl" />
    </Stack>
  )
}

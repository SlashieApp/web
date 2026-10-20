'use client'

import { Box, Skeleton, SkeletonCircle, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { APP_HOME } from '@/utils/appRoutes'
import { Button, Card, Link } from '@ui'

import bag from '../../i11n.json'
import type { PublicProfileStatusConfig } from '../../views'

/** Error and unavailable profiles. The copy never carries account data. */
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
    <Box as="section" px={PAGE_GUTTER_X} py={{ base: 10, md: 16 }}>
      <Card layout="section" heading={copy.title} maxW="lg" mx="auto">
        <Text color="text.muted">{copy.body}</Text>
        {config.action === 'retry' ? (
          onRetry ? (
            <Button type="button" alignSelf="flex-start" onClick={onRetry}>
              {label}
            </Button>
          ) : null
        ) : (
          <Button asChild alignSelf="flex-start" variant="secondary">
            <Link href={APP_HOME} _hover={{ textDecoration: 'none' }}>
              {label}
            </Link>
          </Button>
        )}
      </Card>
    </Box>
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

'use client'

import { Box, Container, Text } from '@chakra-ui/react'

import { Button, Card } from '@ui'

type PublicUserStatusProps = {
  variant: 'notFound' | 'error'
  title: string
  description: string
  retryLabel?: string
  onRetry?: () => void
}

/** Missing, private, and failed profile loads. Copy stays free of account data. */
export function PublicUserStatus({
  variant,
  title,
  description,
  retryLabel,
  onRetry,
}: PublicUserStatusProps) {
  return (
    <Box as="section" py={{ base: 8, md: 10 }}>
      <Container>
        <Card layout="section" heading={title} maxW="lg" mx="auto">
          <Text color="text.muted" mb={variant === 'error' ? 4 : 0}>
            {description}
          </Text>
          {variant === 'error' && onRetry && retryLabel ? (
            <Button type="button" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
        </Card>
      </Container>
    </Box>
  )
}

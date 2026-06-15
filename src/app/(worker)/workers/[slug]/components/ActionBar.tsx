'use client'

import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

type ActionBarProps = {
  fromTask?: string | null
}

export function ActionBar({ fromTask }: ActionBarProps) {
  const taskSlug = fromTask?.trim()
  const hasTaskContext = Boolean(taskSlug)

  return (
    <Box
      position={{ base: 'sticky', md: 'static' }}
      bottom={{ base: 0, md: 'auto' }}
      zIndex={{ base: 10, md: 'auto' }}
      bg={{ base: 'cardBg', md: 'transparent' }}
      borderTopWidth={{ base: '1px', md: 0 }}
      borderColor="cardBorder"
      px={{ base: 4, md: 0 }}
      py={{ base: 4, md: 0 }}
      mx={{ base: -4, md: 0 }}
      boxShadow={{ base: 'sm', md: 'none' }}
    >
      <Stack gap={3}>
        {hasTaskContext ? (
          <>
            <Text fontSize="sm" color="formLabelMuted">
              Compare this worker&apos;s quote on the task page before you
              accept. Payment is arranged directly between you and the worker
              outside Slashie.
            </Text>
            <HStack gap={3} flexWrap="wrap">
              <Link
                as={NextLink}
                href={`/tasks/${taskSlug}`}
                _hover={{ textDecoration: 'none' }}
                flex={{ base: '1 1 100%', sm: '0 1 auto' }}
              >
                <Button w={{ base: 'full', sm: 'auto' }}>Back to task</Button>
              </Link>
              <Link
                as={NextLink}
                href={`/tasks/${taskSlug}#owner-quotes`}
                _hover={{ textDecoration: 'none' }}
                flex={{ base: '1 1 100%', sm: '0 1 auto' }}
              >
                <Button variant="secondary" w={{ base: 'full', sm: 'auto' }}>
                  View quote on task
                </Button>
              </Link>
            </HStack>
          </>
        ) : (
          <>
            <Text fontSize="sm" color="formLabelMuted">
              Browse open tasks to post a job or send a quote. Slashie does not
              process payments — you arrange payment directly with the other
              party.
            </Text>
            <HStack gap={3} flexWrap="wrap">
              <Link
                as={NextLink}
                href="/tasks"
                _hover={{ textDecoration: 'none' }}
              >
                <Button w={{ base: 'full', sm: 'auto' }}>Browse tasks</Button>
              </Link>
              <Link
                as={NextLink}
                href="/worker/setup"
                _hover={{ textDecoration: 'none' }}
              >
                <Button variant="secondary" w={{ base: 'full', sm: 'auto' }}>
                  Become a worker
                </Button>
              </Link>
            </HStack>
          </>
        )}
      </Stack>
    </Box>
  )
}

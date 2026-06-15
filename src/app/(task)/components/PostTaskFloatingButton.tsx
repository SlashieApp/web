'use client'

import { Box, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button } from '@ui'

export function PostTaskFloatingButton() {
  return (
    <Box
      position="absolute"
      right={3}
      bottom="100%"
      mb={2}
      zIndex={1}
      pointerEvents="auto"
    >
      <Link
        as={NextLink}
        href="/tasks/create"
        _hover={{ textDecoration: 'none' }}
      >
        <Button
          size="sm"
          borderRadius="full"
          boxShadow="0 8px 20px rgba(15, 23, 42, 0.18)"
        >
          Post a task
        </Button>
      </Link>
    </Box>
  )
}

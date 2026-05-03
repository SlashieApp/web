'use client'

import { Box, Button, Grid, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useTaskDetail } from '../context/TaskDetailProvider'

export function TaskDetailMobileStickyQuoteBar() {
  const { task, isOwner, isAuthenticated, scrollToQuoteForm } = useTaskDetail()

  if (isOwner || !task) return null

  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="sticky"
      bottom={0}
      zIndex={30}
      bg="bg"
      borderTopWidth="1px"
      borderColor="cardBorder"
      px={4}
      py={3}
    >
      <Grid templateColumns="1fr 2fr" gap={3}>
        <Button
          type="button"
          variant="outline"
          w="full"
          h="48px"
          borderRadius="lg"
        >
          Save
        </Button>
        {isAuthenticated ? (
          <Button
            type="button"
            w="full"
            h="48px"
            borderRadius="lg"
            onClick={scrollToQuoteForm}
          >
            Send a quote
          </Button>
        ) : (
          <Link
            as={NextLink}
            href={`/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`}
            _hover={{ textDecoration: 'none' }}
            display="block"
          >
            <Button w="full" h="48px" borderRadius="lg">
              Log in to quote
            </Button>
          </Link>
        )}
      </Grid>
    </Box>
  )
}

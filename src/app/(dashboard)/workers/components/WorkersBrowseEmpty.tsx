import { Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Button, Link } from '@ui'

type WorkersBrowseEmptyProps = {
  variant: 'no_workers' | 'no_search_results'
}

export function WorkersBrowseEmpty({ variant }: WorkersBrowseEmptyProps) {
  if (variant === 'no_search_results') {
    return (
      <BoxMessage>
        <Text color="formLabelMuted">No workers match your search.</Text>
      </BoxMessage>
    )
  }

  return (
    <BoxMessage>
      <Stack gap={4} align={{ base: 'stretch', sm: 'flex-start' }}>
        <Text color="formLabelMuted">
          No workers in your area yet. Post a task to start receiving quotes
          from local pros.
        </Text>
        <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
          <Link href="/tasks" _hover={{ textDecoration: 'none' }}>
            <Button variant="secondary">Browse tasks</Button>
          </Link>
          <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
            <Button>Post a task</Button>
          </Link>
        </Stack>
      </Stack>
    </BoxMessage>
  )
}

function BoxMessage({ children }: { children: ReactNode }) {
  return (
    <Stack
      gap={3}
      p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderColor="cardBorder"
      borderRadius="2xl"
      bg="cardBg"
      boxShadow="sm"
    >
      {children}
    </Stack>
  )
}

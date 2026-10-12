'use client'

import { Box, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W } from '@/theme/pageContainer'

import bag from '../i11n.json'
import { ThreadList } from './ThreadList'
import { ThreadView } from './ThreadView'

/**
 * Messages (FE-202). Desktop: inbox and the open thread side by side.
 * Mobile: the inbox, then the thread full screen.
 */
export function MessagesScreen({ threadId }: { threadId: string | null }) {
  const t = useI11n(bag)
  const open = Boolean(threadId)

  return (
    <Box
      h="full"
      w="full"
      maxW={PAGE_CONTAINER_MAX_W}
      mx="auto"
      display="grid"
      gridTemplateColumns={{ base: '1fr', lg: '360px minmax(0, 1fr)' }}
      bg="bg.surface"
      borderXWidth={{ base: 0, lg: '1px' }}
      borderColor="border.default"
    >
      <Box
        display={{ base: open ? 'none' : 'flex', lg: 'flex' }}
        flexDirection="column"
        minH={0}
        borderRightWidth={{ base: 0, lg: '1px' }}
        borderColor="border.default"
      >
        <ThreadList selectedId={threadId} />
      </Box>
      <Box
        display={{ base: open ? 'flex' : 'none', lg: 'flex' }}
        flexDirection="column"
        minH={0}
        minW={0}
      >
        {threadId ? (
          <ThreadView key={threadId} threadId={threadId} />
        ) : (
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={6}
          >
            <Text color="text.muted" fontSize="sm">
              {t.pickThread}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  )
}

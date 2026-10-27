'use client'

import { Box, VisuallyHidden } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import bag from '../i11n.json'
import { ThreadList } from './ThreadList'
import { ThreadView } from './ThreadView'

/**
 * Messages (FE-202). Desktop: inbox and the open thread side by side, in the
 * page container inside its gutters, so the panel's edges line up with the
 * header's logo and menu (FE-457). Mobile: the inbox, then the thread full
 * screen.
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
      px={{ base: 0, lg: PAGE_GUTTER_X.lg }}
    >
      <Box
        h="full"
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '360px minmax(0, 1fr)' }}
        bg="bg.surface"
        borderXWidth={{ base: 0, lg: '1px' }}
        borderColor="border.default"
      >
        {/* Phones show one pane at a time, so the h1 can't live in either. */}
        <VisuallyHidden as="h1">{t.title}</VisuallyHidden>
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
          <ThreadView key={threadId ?? 'none'} threadId={threadId} />
        </Box>
      </Box>
    </Box>
  )
}

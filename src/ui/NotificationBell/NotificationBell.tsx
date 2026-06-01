'use client'

import {
  Badge,
  Box,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback } from 'react'

import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import {
  notificationDisplayText,
  notificationTaskHref,
} from '@/utils/notifications'
import { AppDrawer, Button } from '@ui'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Notifications</title>
      <path
        d="M6 16h12l-1.5-2.2v-3.5a4.5 4.5 0 0 0-9 0v3.5L6 16Zm4 2a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function NotificationBell() {
  const notifications = useNotificationsOptional()
  if (!notifications) return null

  const {
    items,
    unreadCount,
    loading,
    drawerOpen,
    openDrawer,
    closeDrawer,
    markRead,
    markAllRead,
  } = notifications

  const onOpenItem = useCallback(
    async (id: string, readAt: string | null | undefined) => {
      if (!readAt) {
        await markRead(id)
      }
      closeDrawer()
    },
    [closeDrawer, markRead],
  )

  return (
    <>
      <Box position="relative" display="inline-flex">
        <IconButton
          type="button"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications'
          }
          variant="ghost"
          size="sm"
          color="formLabelMuted"
          bg="badgeBg"
          borderRadius="full"
          onClick={openDrawer}
          _hover={{ bg: 'cardBg', color: 'cardFg' }}
        >
          <BellIcon />
        </IconButton>
        {unreadCount > 0 ? (
          <Badge
            position="absolute"
            top="-2px"
            right="-2px"
            minW="18px"
            h="18px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            fontSize="10px"
            fontWeight={700}
            bg="primary.600"
            color="white"
            px={1}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        ) : null}
      </Box>

      <AppDrawer
        open={drawerOpen}
        onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}
        title="Notifications"
        placement="end"
        size="sm"
      >
        <Stack gap={4} h="full">
          <HStack justify="space-between">
            <Text fontSize="sm" color="formLabelMuted">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'You are all caught up'}
            </Text>
            {unreadCount > 0 ? (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                onClick={() => void markAllRead()}
              >
                Mark all read
              </Button>
            ) : null}
          </HStack>

          <Stack gap={2} flex="1" overflowY="auto">
            {loading && items.length === 0 ? (
              <Text fontSize="sm" color="formLabelMuted">
                Loading…
              </Text>
            ) : items.length === 0 ? (
              <Text fontSize="sm" color="formLabelMuted">
                No notifications yet. Activity on your tasks and quotes will
                show up here.
              </Text>
            ) : (
              items.map((item) => {
                const { title, description } = notificationDisplayText(item)
                const unread = !item.readAt
                return (
                  <Link
                    key={item.id}
                    as={NextLink}
                    href={notificationTaskHref(item.taskId, item.orderId)}
                    display="block"
                    p={3}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={unread ? 'primary.200' : 'cardBorder'}
                    bg={unread ? 'primary.50' : 'cardBg'}
                    _hover={{ textDecoration: 'none', bg: 'badgeBg' }}
                    onClick={() => void onOpenItem(item.id, item.readAt)}
                  >
                    <Stack gap={1}>
                      <HStack justify="space-between" gap={2}>
                        <Text fontSize="sm" fontWeight={700} lineClamp={2}>
                          {title}
                        </Text>
                        {unread ? (
                          <Box
                            boxSize="8px"
                            borderRadius="full"
                            bg="primary.600"
                            flexShrink={0}
                            aria-hidden
                          />
                        ) : null}
                      </HStack>
                      <Text fontSize="xs" color="formLabelMuted" lineClamp={2}>
                        {description}
                      </Text>
                      <Text fontSize="xs" color="formLabelMuted">
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </Stack>
                  </Link>
                )
              })
            )}
          </Stack>
        </Stack>
      </AppDrawer>
    </>
  )
}

'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'

import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { EVENTS, capture } from '@/utils/analytics'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import {
  notificationDisplayText,
  notificationTaskHref,
} from '@/utils/notifications'
import { Button, Drawer, Link } from '@ui'

import { focusVisibleMatchesHover } from '../interactionStyles'

const notificationItemHover = {
  textDecoration: 'none',
  bg: 'badgeBg',
} as const

export function NotificationsDrawer() {
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
      capture(EVENTS.notification_open, {
        notification_id: id,
        was_unread: !readAt,
      })
      if (!readAt) {
        await markRead(id)
      }
      closeDrawer()
    },
    [closeDrawer, markRead],
  )

  return (
    <Drawer
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
              No notifications yet. Activity on your tasks and quotes will show
              up here.
            </Text>
          ) : (
            items.map((item) => {
              const { title, description } = notificationDisplayText(item)
              const unread = !item.readAt
              return (
                <Link
                  key={item.id}
                  href={notificationTaskHref(item.taskId, item.orderId)}
                  display="block"
                  p={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={unread ? 'primary.200' : 'cardBorder'}
                  bg={unread ? 'primary.50' : 'cardBg'}
                  _hover={notificationItemHover}
                  {...focusVisibleMatchesHover(notificationItemHover)}
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
    </Drawer>
  )
}

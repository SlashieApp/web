'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useCallback } from 'react'
import bag from '../i11n.json'

import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import type { AppLocale } from '@/i18n/locales'
import { EVENTS, capture } from '@/utils/analytics'
import {
  notificationDisplayText,
  notificationTaskHref,
} from '@/utils/notifications'
import { Button } from '../../Button'
import { Drawer } from '../../Drawer'
import { Link } from '../../Link'

import { focusVisibleMatchesHover } from '@/theme/system'

const notificationItemHover = {
  textDecoration: 'none',
  bg: 'bg.subtle',
} as const

function formatNotificationRelativeTime(
  isoOrDate: unknown,
  relative: {
    recently: string
    justNow: string
    minutesAgo: string
    hoursAgo: string
    daysAgo: string
  },
  locale: AppLocale,
): string {
  const date =
    typeof isoOrDate === 'string' || typeof isoOrDate === 'number'
      ? new Date(isoOrDate)
      : isoOrDate instanceof Date
        ? isoOrDate
        : null
  if (!date || Number.isNaN(date.getTime())) return relative.recently

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return relative.justNow
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return formatMessage(relative.minutesAgo, { count: minutes })
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return formatMessage(relative.hoursAgo, { count: hours })
  }
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return formatMessage(relative.daysAgo, { count: days })
  }
  return date.toLocaleDateString(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function NotificationsDrawer() {
  const locale = useLocale()
  const t = useI11n(bag).notifications
  const notifications = useNotificationsOptional()

  const onOpenItem = useCallback(
    async (id: string, readAt: string | null | undefined) => {
      if (!notifications) return
      capture(EVENTS.notification_open, {
        notification_id: id,
        was_unread: !readAt,
      })
      if (!readAt) {
        await notifications.markRead(id)
      }
      notifications.closeDrawer()
    },
    [notifications],
  )

  if (!notifications) return null

  const {
    items,
    unreadCount,
    loading,
    drawerOpen,
    openDrawer,
    closeDrawer,
    markAllRead,
  } = notifications

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}
      title={t.title}
      placement="end"
      size="sm"
    >
      <Stack gap={4} h="full">
        <HStack justify="space-between">
          <Text fontSize="sm" color="text.muted">
            {unreadCount > 0
              ? formatMessage(t.unreadCount, { count: unreadCount })
              : t.allCaughtUp}
          </Text>
          {unreadCount > 0 ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => void markAllRead()}
            >
              {t.markAllRead}
            </Button>
          ) : null}
        </HStack>

        <Stack gap={2} flex="1" overflowY="auto">
          {loading && items.length === 0 ? (
            <Text fontSize="sm" color="text.muted">
              {t.loading}
            </Text>
          ) : items.length === 0 ? (
            <Text fontSize="sm" color="text.muted">
              {t.empty}
            </Text>
          ) : (
            items.map((item) => {
              const { title, description } = notificationDisplayText(item, t)
              const unread = !item.readAt
              return (
                <Link
                  key={item.id}
                  href={notificationTaskHref(item.taskId, item.orderId)}
                  display="block"
                  p={3}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={unread ? 'green.200' : 'border.default'}
                  bg={unread ? 'status.success.soft' : 'bg.surface'}
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
                          bg="status.success.solid"
                          flexShrink={0}
                          aria-hidden
                        />
                      ) : null}
                    </HStack>
                    <Text fontSize="xs" color="text.muted" lineClamp={2}>
                      {description}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {formatNotificationRelativeTime(
                        item.createdAt,
                        t.relative,
                        locale,
                      )}
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

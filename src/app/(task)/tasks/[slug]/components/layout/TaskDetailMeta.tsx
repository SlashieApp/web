'use client'

import { Box, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import {
  LuCalendar,
  LuChevronRight,
  LuClock,
  LuMapPin,
  LuTag,
} from 'react-icons/lu'

import { useLocale } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Avatar, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskDetailCategoryTag,
  taskDetailDurationTag,
  taskDetailLocationTag,
  taskDetailOwnerTag,
  taskDetailTimeTag,
} from '../../helpers/taskDetailMetaTags'
import { taskDetailShowsExactLocation } from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'

const DATE_LOCALE = {
  en: 'en-GB',
  'zh-hk': 'zh-HK',
} as const

export function MetaPill({
  icon,
  children,
  href,
}: {
  icon: ReactNode
  children: ReactNode
  href?: string | null
}) {
  const content = (
    <>
      <Box
        color="text.muted"
        display="flex"
        alignItems="center"
        flexShrink={0}
        aria-hidden
      >
        {icon}
      </Box>
      {children}
    </>
  )
  const pill = {
    gap: 1.5,
    px: 2.5,
    py: 1,
    borderRadius: 'full',
    bg: 'bg.subtle',
    color: 'text.default',
    fontSize: 'sm',
    fontWeight: 500,
    lineHeight: 'short',
    flexShrink: 0,
    minH: '32px',
    whiteSpace: 'nowrap',
  } as const

  if (!href) {
    return <HStack {...pill}>{content}</HStack>
  }

  return (
    <Link
      href={href}
      tone="muted"
      display="inline-flex"
      alignItems="center"
      {...pill}
      _hover={{
        textDecoration: 'none',
        bg: 'bg.canvas',
        color: 'text.default',
      }}
    >
      {content}
    </Link>
  )
}

type TaskDetailMetaProps = {
  /**
   * Before the chrome sticks, web chips wrap inside half the page.
   * Once stuck, they stay on one row and scroll sideways.
   */
  isStuck?: boolean
}

const STUCK_ROW_SCROLL_CSS = {
  scrollbarWidth: 'none',
  overscrollBehaviorX: 'contain',
  '&::-webkit-scrollbar': { display: 'none' },
} as const

/**
 * Sticky meta row under the task title: location, when, duration, category,
 * and owner. Interest (medium) is not a chip. Location, category, and owner
 * navigate.
 */
export function TaskDetailMeta({ isStuck = false }: TaskDetailMetaProps) {
  const { task, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useLocale()

  if (!task) return null

  const location = taskDetailLocationTag({
    task,
    myOrder,
    showExactLocation: taskDetailShowsExactLocation({
      myOrder,
      showFullAddress: permissions.showFullAddress,
    }),
  })
  const time = taskDetailTimeTag(task, t.meta, new Date(), DATE_LOCALE[locale])
  const duration = taskDetailDurationTag(task)
  const category = taskDetailCategoryTag(task)
  const owner = taskDetailOwnerTag(task, t.details.ownerFallback)

  if (!location && !time && !duration && !category && !owner) return null

  return (
    <Box
      w="full"
      minW={0}
      maxW={{ base: 'full', lg: isStuck ? 'full' : '50%' }}
      overflowX={isStuck ? 'auto' : 'visible'}
      css={isStuck ? STUCK_ROW_SCROLL_CSS : undefined}
    >
      <HStack
        gap={2}
        flexWrap={isStuck ? 'nowrap' : 'wrap'}
        alignItems="center"
        w={isStuck ? 'max-content' : 'full'}
        minW={0}
      >
        {location ? (
          <MetaPill href={location.href} icon={<LuMapPin size={16} />}>
            {location.label}
          </MetaPill>
        ) : null}
        {time ? (
          <MetaPill icon={<LuCalendar size={16} />}>{time}</MetaPill>
        ) : null}
        {duration ? (
          <MetaPill icon={<LuClock size={16} />}>{duration}</MetaPill>
        ) : null}
        {category ? (
          <MetaPill href={category.href} icon={<LuTag size={16} />}>
            {category.label}
          </MetaPill>
        ) : null}
        {owner ? (
          <MetaPill
            href={owner.href}
            icon={
              <Avatar
                name={owner.name}
                src={owner.avatarUrl ?? undefined}
                size="xs"
                rootProps={{ boxSize: '20px' }}
              />
            }
          >
            {owner.name}
            <Box color="text.muted" display="flex" aria-hidden>
              <LuChevronRight size={16} />
            </Box>
          </MetaPill>
        ) : null}
      </HStack>
    </Box>
  )
}

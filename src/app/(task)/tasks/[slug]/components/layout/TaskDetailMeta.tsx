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
import { WEB_MQ } from '@/theme/breakpoints'
import { Avatar, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskDetailCategoryChips,
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
    scrollSnapAlign: 'start',
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

const ROW_SCROLL_CSS = {
  scrollbarWidth: 'none',
  overscrollBehaviorX: 'contain',
  '&::-webkit-scrollbar': { display: 'none' },
} as const

const EDGE_FADE =
  'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)'

/** Phones: one swipeable line with snap and faded edges (FE-258). */
const MOBILE_ROW_CSS = {
  ...ROW_SCROLL_CSS,
  scrollSnapType: 'x proximity',
  scrollPaddingInline: '12px',
  maskImage: EDGE_FADE,
  WebkitMaskImage: EDGE_FADE,
  [`@media screen and ${WEB_MQ}`]: {
    maskImage: 'none',
    WebkitMaskImage: 'none',
  },
} as const

/**
 * Sticky meta row under the task title: location, when, duration, every
 * category, and owner. Interest (medium) is not a chip. Location, category,
 * and owner navigate.
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
  const categories = taskDetailCategoryChips(task)
  const owner = taskDetailOwnerTag(task, t.details.ownerFallback)

  if (!location && !time && !duration && categories.length === 0 && !owner) {
    return null
  }

  return (
    <Box
      minW={0}
      // Bleed into the page gutter so the edge fade sits outside the chips.
      mx={{ base: -3, lg: 0 }}
      maxW={{ base: 'none', lg: isStuck ? 'full' : '50%' }}
      overflowX={{ base: 'auto', lg: isStuck ? 'auto' : 'visible' }}
      css={isStuck ? { ...MOBILE_ROW_CSS, ...ROW_SCROLL_CSS } : MOBILE_ROW_CSS}
    >
      <HStack
        gap={2}
        flexWrap={{ base: 'nowrap', lg: isStuck ? 'nowrap' : 'wrap' }}
        alignItems="center"
        w={{ base: 'max-content', lg: isStuck ? 'max-content' : 'full' }}
        px={{ base: 3, lg: 0 }}
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
        {categories.map((category) => (
          <MetaPill
            key={category.label.toLowerCase()}
            href={category.href}
            icon={<LuTag size={16} />}
          >
            {category.label}
          </MetaPill>
        ))}
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

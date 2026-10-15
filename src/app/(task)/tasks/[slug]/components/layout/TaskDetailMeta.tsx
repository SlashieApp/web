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

const EDGE_FADE =
  'linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%)'

/**
 * One line on every viewport (FE-258): sideways scroll with snap, no
 * scrollbar, faded edges. Mouse users drag it (grab cursor).
 */
const ROW_CSS = {
  scrollbarWidth: 'none',
  overscrollBehaviorX: 'contain',
  '&::-webkit-scrollbar': { display: 'none' },
  scrollSnapType: 'x proximity',
  scrollPaddingInline: '12px',
  maskImage: EDGE_FADE,
  WebkitMaskImage: EDGE_FADE,
  '@media (pointer: fine)': { cursor: 'grab' },
  '&[data-dragging]': {
    cursor: 'grabbing',
    scrollSnapType: 'none',
    userSelect: 'none',
    '& *': { cursor: 'grabbing' },
  },
} as const

const DRAG_THRESHOLD_PX = 4

/**
 * Mouse drag scrolls the row sideways. A drag never opens a chip's link, and
 * links don't start a native drag. Touch and trackpads scroll natively.
 */
function dragScroll(node: HTMLDivElement | null) {
  if (!node) return
  let startX = 0
  let startLeft = 0
  let pressed = false
  let dragged = false

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    pressed = true
    dragged = false
    startX = e.clientX
    startLeft = node.scrollLeft
  }
  const onMove = (e: PointerEvent) => {
    if (!pressed) return
    const dx = e.clientX - startX
    if (!dragged) {
      if (Math.abs(dx) < DRAG_THRESHOLD_PX) return
      dragged = true
      node.setAttribute('data-dragging', '')
      node.setPointerCapture(e.pointerId)
    }
    node.scrollLeft = startLeft - dx
  }
  const onUp = (e: PointerEvent) => {
    if (!pressed) return
    pressed = false
    node.removeAttribute('data-dragging')
    if (node.hasPointerCapture(e.pointerId)) {
      node.releasePointerCapture(e.pointerId)
    }
  }
  const onClick = (e: MouseEvent) => {
    if (!dragged) return
    dragged = false
    e.preventDefault()
    e.stopPropagation()
  }
  const onDragStart = (e: DragEvent) => e.preventDefault()

  node.addEventListener('pointerdown', onDown)
  node.addEventListener('pointermove', onMove)
  node.addEventListener('pointerup', onUp)
  node.addEventListener('pointercancel', onUp)
  node.addEventListener('click', onClick, true)
  node.addEventListener('dragstart', onDragStart)
  return () => {
    node.removeEventListener('pointerdown', onDown)
    node.removeEventListener('pointermove', onMove)
    node.removeEventListener('pointerup', onUp)
    node.removeEventListener('pointercancel', onUp)
    node.removeEventListener('click', onClick, true)
    node.removeEventListener('dragstart', onDragStart)
  }
}

/**
 * Sticky meta row under the task title: location, when, duration, every
 * category, and owner. Interest (medium) is not a chip. Location, category,
 * and owner navigate.
 */
export function TaskDetailMeta() {
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
      ref={dragScroll}
      minW={0}
      // Bleed into the page gutter so the edge fade sits outside the chips.
      mx={-3}
      overflowX="auto"
      css={ROW_CSS}
    >
      <HStack
        gap={2}
        flexWrap="nowrap"
        alignItems="center"
        w="max-content"
        px={3}
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

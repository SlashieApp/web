'use client'

import { Box, type BoxProps, List, chakra } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'

import { sdlMotion } from '@/theme/styles'

import { STORY_INDEX_TOP } from './storyLayout'
import { useStoryStage } from './storyState'
import type { StoryIndexItem } from './storySteps'

const Anchor = chakra('a')

/**
 * The how-it-works section index: one short label per step, grouped by act (a
 * gap, or a hairline in the row, between the customer's and the worker's).
 *
 * From `lg` it is a list in the left column, stuck under the header, on a 1px
 * hairline; below `lg` it is a row that sticks right under the header and
 * scrolls sideways when the labels do not fit. Either way the link of the
 * step on screen reads `text.default` with a 2px green 600 bar (a vertical bar
 * from `lg`, an underline in the row) and the others read `text.subtle`; the
 * active step is the story tracker's (`useStoryStage`), so the index and the
 * phone always agree. Each label links to its step's row. In the row the
 * active label is scrolled into view.
 *
 * It must be a direct child of the box that spans both acts, so that it can
 * stick along the whole of them.
 */
export function StoryIndex({
  label,
  groups,
  ...boxProps
}: Omit<BoxProps, 'children'> & {
  /** The index's accessible name ("How it works"). */
  label: string
  groups: readonly (readonly StoryIndexItem[])[]
}) {
  const stage = useStoryStage()
  const listRef = useRef<HTMLOListElement>(null)

  // The row scrolls sideways below `lg`: keep the active label in view. (From
  // `lg` the list does not overflow, so there is nothing to do.)
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the active step changes
  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLElement>('[aria-current]')
    if (!list || !active || list.scrollWidth <= list.clientWidth) return
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    list.scrollTo({
      left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }, [stage])

  return (
    <Box
      as="nav"
      aria-label={label}
      data-story-index=""
      position="sticky"
      top={STORY_INDEX_TOP}
      zIndex={3}
      alignSelf="start"
      // Below lg a full-width row on the page, so nothing shows round it.
      mx={{ base: -4, md: -6, lg: 0 }}
      px={{ base: 4, md: 6, lg: 0 }}
      bg={{ base: 'bg.surface', lg: 'transparent' }}
      borderBottomWidth={{ base: '1px', lg: 0 }}
      borderColor="border.default"
      {...boxProps}
    >
      {/* `list-style: none` drops the list in Safari with VoiceOver (the count
          and the order): `List.Root` states the role again. */}
      <List.Root
        as="ol"
        ref={listRef}
        position="relative"
        listStyleType="none"
        m={0}
        p={0}
        display="flex"
        flexDirection={{ base: 'row', lg: 'column' }}
        overflowX={{ base: 'auto', lg: 'visible' }}
        borderInlineStartWidth={{ base: 0, lg: '1px' }}
        borderColor="border.default"
        css={{
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {groups.map((items, groupIndex) => (
          <GroupItems
            // The groups are fixed and in order.
            // biome-ignore lint/suspicious/noArrayIndexKey: static, ordered list
            key={groupIndex}
            items={items}
            stage={stage}
            separated={groupIndex > 0}
          />
        ))}
      </List.Root>
    </Box>
  )
}

function GroupItems({
  items,
  stage,
  separated,
}: {
  items: readonly StoryIndexItem[]
  stage: string
  separated: boolean
}) {
  return (
    <>
      {separated ? (
        <Box
          as="li"
          role="presentation"
          aria-hidden
          data-story-index-gap=""
          flexShrink={0}
          // Below lg a hairline in the row; from lg a gap in the list.
          alignSelf={{ base: 'center', lg: 'stretch' }}
          w={{ base: '1px', lg: 'auto' }}
          h={{ base: '16px', lg: '20px' }}
          mx={{ base: 1, lg: 0 }}
          bg={{ base: 'border.default', lg: 'transparent' }}
        />
      ) : null}
      {items.map((item) => {
        const active = item.stage === stage
        return (
          <Box as="li" key={item.stage} flexShrink={0}>
            <Anchor
              href={item.href}
              aria-current={active ? 'location' : undefined}
              position="relative"
              display="block"
              whiteSpace="nowrap"
              textStyle="text-sm"
              fontWeight={500}
              textDecoration="none"
              py={{ base: '12px', lg: '5px' }}
              px={{ base: 3, lg: 0 }}
              ps={{ lg: 4 }}
              pe={{ lg: 3 }}
              color={active ? 'text.default' : 'text.subtle'}
              transitionProperty="color"
              transitionDuration={sdlMotion.duration.moderate}
              transitionTimingFunction={sdlMotion.easing.standard}
              _hover={{ color: 'text.default' }}
              // Inset, so the row's overflow does not clip the ring.
              _focusVisible={{
                outline: '2px solid',
                outlineColor: 'border.focus',
                outlineOffset: '-2px',
                borderRadius: 'sm',
              }}
              css={{
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              }}
            >
              {item.label}
              <Box
                as="span"
                aria-hidden
                data-story-index-bar=""
                position="absolute"
                bg="accent.active"
                opacity={active ? 1 : 0}
                transitionProperty="opacity"
                transitionDuration={sdlMotion.duration.moderate}
                transitionTimingFunction={sdlMotion.easing.standard}
                // An underline in the row; a bar over the list's hairline from lg.
                left={{ base: 0, lg: '-1px' }}
                right={{ base: 0, lg: 'auto' }}
                top={{ base: 'auto', lg: 0 }}
                bottom={0}
                h={{ base: '2px', lg: 'auto' }}
                w={{ base: 'auto', lg: '2px' }}
                css={{
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                  // Forced colours (Windows high contrast) paint every
                  // background Canvas, which would hide the bar and leave the
                  // active label the same as the rest: take the system
                  // highlight instead.
                  '@media (forced-colors: active)': {
                    backgroundColor: 'Highlight',
                  },
                }}
              />
            </Anchor>
          </Box>
        )
      })}
    </>
  )
}

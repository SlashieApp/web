'use client'

import {
  Box,
  Grid,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react'
import { useId } from 'react'
import type { IconType } from 'react-icons'
import {
  LuArmchair,
  LuBrush,
  LuDroplets,
  LuEllipsis,
  LuHammer,
  LuLeaf,
  LuMonitor,
  LuShoppingBag,
  LuSparkles,
  LuTruck,
  LuWrench,
  LuZap,
} from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { formHelperTextStyle, sdlFocusRing, sdlMotion } from '@/theme/styles'
import { formControlLabelProps } from '@ui'

import {
  WORKER_PRIMARY_CATEGORIES,
  type WorkerTradeSlug,
} from '../../../helpers/workerSetupCategories'
import bag from '../../../i11n.json'

const CATEGORY_ICONS: Record<WorkerTradeSlug, IconType> = {
  handyman: LuWrench,
  'furniture-assembly': LuArmchair,
  mounting: LuMonitor,
  plumbing: LuDroplets,
  electrical: LuZap,
  carpentry: LuHammer,
  painting: LuBrush,
  cleaning: LuSparkles,
  gardening: LuLeaf,
  removals: LuTruck,
  delivery: LuShoppingBag,
  other: LuEllipsis,
}

const Tile = chakra('label')

export type WorkerSetupCategoryTilesProps = {
  label: string
  helperText?: string
  value: string
  onChange: (slug: WorkerTradeSlug) => void
  errorText?: string
}

/**
 * The main trade as icon tiles over a native radio set: arrow keys move the
 * choice, it is announced, and shown by the border and tint together.
 *
 * Form spacing (FE-481): a choice group lays out like a field. The legend is the
 * form label, `labelToControl` (8) above the tiles, the tiles are
 * `alternativesGap` (8) apart, and the helper and the error sit
 * `controlToHelper` (4) under them on the compact line.
 */
export function WorkerSetupCategoryTiles({
  label,
  helperText,
  value,
  onChange,
  errorText,
}: WorkerSetupCategoryTilesProps) {
  const trades = useI11n(bag).trades
  const id = useId()
  const helperId = helperText ? `${id}-helper` : undefined
  const errorId = errorText ? `${id}-error` : undefined

  return (
    <Box
      as="fieldset"
      display="flex"
      flexDirection="column"
      gap={0}
      minW={0}
      aria-describedby={
        [helperId, errorId].filter(Boolean).join(' ') || undefined
      }
      data-invalid={errorText ? '' : undefined}
    >
      <Box as="legend" {...formControlLabelProps} px={1}>
        {label}
      </Box>
      <Grid
        templateColumns={{ base: '1fr 1fr', md: '1fr 1fr 1fr' }}
        gap="form.alternativesGap"
      >
        {WORKER_PRIMARY_CATEGORIES.map(({ slug }) => {
          const Icon = CATEGORY_ICONS[slug]
          const selected = slug === value
          return (
            <Tile
              key={slug}
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              gap={2}
              p={3}
              minH="72px"
              borderRadius="lg"
              borderWidth="2px"
              borderColor={selected ? 'accent.active' : 'border.default'}
              bg={selected ? 'status.success.soft' : 'bg.surface'}
              color={selected ? 'status.success.fg' : 'text.default'}
              cursor="pointer"
              transitionProperty="background-color, border-color, color"
              transitionDuration={sdlMotion.duration.base}
              transitionTimingFunction={sdlMotion.easing.standard}
              _hover={
                selected
                  ? undefined
                  : { borderColor: 'border.strong', bg: 'bg.subtle' }
              }
              _focusWithin={sdlFocusRing}
            >
              <VisuallyHidden asChild>
                <input
                  type="radio"
                  name={id}
                  value={slug}
                  checked={selected}
                  onChange={() => onChange(slug)}
                />
              </VisuallyHidden>
              <Icon size={18} strokeWidth={2} aria-hidden />
              <Text as="span" fontSize="sm" fontWeight={500} lineHeight="short">
                {trades[slug].label}
              </Text>
            </Tile>
          )
        })}
      </Grid>
      {helperText || errorText ? (
        <Stack gap="form.helperGap" mt="form.controlToHelper">
          {helperText ? (
            <Text id={helperId} {...formHelperTextStyle} px={1}>
              {helperText}
            </Text>
          ) : null}
          {errorText ? (
            <Text
              id={errorId}
              fontSize="sm"
              lineHeight="20px"
              color="status.danger.fg"
              px={1}
            >
              {errorText}
            </Text>
          ) : null}
        </Stack>
      ) : null}
    </Box>
  )
}

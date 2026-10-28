'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { useState } from 'react'

import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { ImagePreview } from '@ui'

import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { taskAvailabilityRangeLabel } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import detailBag from '@/app/(task)/tasks/[slug]/i11n.json'

import bag from '../../../i11n.json'

const PhotoButton = chakra('button')

export function TaskQuoteSummaryCard() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  const detail = useI11n(detailBag)
  const dateLocale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  if (!task) return null
  const title = task.title?.trim() || detail.fallbackTask
  // The card shows the first photo; tapping it pages through all of them.
  const photos = (task.images ?? [])
    .map((src) => src?.trim())
    .filter((src): src is string => Boolean(src))
    .map((src, index) => ({
      src,
      alt: formatMessage(detail.details.photoAlt, { title, n: index + 1 }),
    }))
  const thumb = photos[0]
  const locationLine = taskPublicLocationLabel(task)
  const budgetType = task.budget?.type
  const kind = budgetType ? (t.summary.budgetKind[budgetType] ?? null) : null
  const when = taskAvailabilityRangeLabel(task, {
    locale: dateLocale,
    typeLabels: t.summary.timing,
  })

  return (
    <HStack
      align="start"
      gap={3}
      p={3}
      rounded="lg"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      boxShadow="e1"
    >
      {thumb ? (
        <PhotoButton
          type="button"
          onClick={() => setPreviewIndex(0)}
          w="72px"
          h="72px"
          rounded="lg"
          overflow="hidden"
          flexShrink={0}
          cursor="zoom-in"
          _hover={{ opacity: 0.85 }}
          _focusVisible={sdlFocusRing}
        >
          <img
            src={thumb.src}
            alt={thumb.alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </PhotoButton>
      ) : (
        <Box w="72px" h="72px" rounded="lg" bg="bg.subtle" flexShrink={0} />
      )}
      <Stack gap={1} minW={0}>
        <Text fontWeight={500} fontSize="sm" lineClamp={2} color="text.link">
          {task.title}
        </Text>
        {locationLine ? (
          <Text fontSize="xs" color="text.muted" lineClamp={2}>
            {locationLine}
          </Text>
        ) : null}
        {/* FE-70: the quoting worker sees only the approximate area. */}
        <Text fontSize="xs" color="text.muted">
          {t.locationNote}
        </Text>
        <Text fontSize="xs" color="text.muted">
          {when}
        </Text>
        {kind ? (
          <Text fontSize="xs" fontWeight={500} color="text.link">
            {kind}
          </Text>
        ) : null}
      </Stack>
      <ImagePreview
        items={photos}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </HStack>
  )
}

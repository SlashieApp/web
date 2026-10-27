'use client'

import { Box } from '@chakra-ui/react'
import { LuArrowLeft } from 'react-icons/lu'

import { TASK_DETAIL_STUCK_ROW_TOP } from '@/app/(task)/tasks/[slug]/helpers/taskDetailHeaderCollapse'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlMotion } from '@/theme/styles'
import { useGoBack } from '@/utils/goBack'
import { IconButton } from '@ui'

import bag from '../../i11n.json'

/**
 * Workers is not a nav page (FE-445): below lg, where the bottom nav is gone,
 * the map carries a back arrow at its top left, frosted over the map and
 * placed as task detail's pinned one. From lg the header nav takes over.
 */
export function WorkersBackButton() {
  const t = useI11n(bag)
  const onBack = useGoBack()

  return (
    <Box
      display={{ base: 'block', lg: 'none' }}
      position="absolute"
      insetX={0}
      top={TASK_DETAIL_STUCK_ROW_TOP}
      zIndex={2}
      pointerEvents="none"
    >
      <Box w="full" maxW={PAGE_CONTAINER_MAX_W} mx="auto" px={PAGE_GUTTER_X}>
        <Box pointerEvents="auto" w="fit-content">
          <IconButton
            type="button"
            variant="ghost"
            aria-label={t.backAria}
            color="text.default"
            bg="whiteAlpha.700"
            _hover={{ bg: 'whiteAlpha.900', color: 'text.default' }}
            onClick={onBack}
            transitionProperty="background-color, opacity"
            transitionDuration={sdlMotion.duration.slow}
            transitionTimingFunction={sdlMotion.easing.standard}
          >
            <LuArrowLeft />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

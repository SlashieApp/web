'use client'

import { Box } from '@chakra-ui/react'

import { ApproximateAreaPill } from '@/app/(task)/components/ui/ApproximateAreaPill'
import { useApproxPillHeightRef } from '@/app/(task)/context/MarketplaceMapSession'
import { APPROX_PILL_ABOVE_CHROME_PX } from '@/app/(task)/helpers/marketplaceMap/offset/approxFrame'
import { useI11n } from '@/i18n/useI11n'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskMapCoordinates } from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'

/**
 * Below lg: "Approximate area. Exact address after booking." for everyone who
 * does not have the exact address (FE-472), centred, its bottom 8px above the
 * content's top (the title chrome). It is the first child of the content
 * wrapper, so it rides with the content and the collapsing bar covers it as
 * the page scrolls, and it paints above the title's wash. Real text outside
 * the hero's aria-hidden box. It lets every gesture through. From lg the pill
 * is in the map's own layer instead (`MarketplaceMapHost`), so this one is
 * hidden there.
 *
 * It reports its height (one line or two) so the camera puts the circle in the
 * clear window above it.
 */
export function TaskDetailMapPill() {
  const { task, locationAccess } = useTaskDetail()
  const t = useI11n(bag)
  const measureRef = useApproxPillHeightRef()

  if (locationAccess !== 'approximate' || !task || !taskMapCoordinates(task)) {
    return null
  }

  return (
    <Box
      ref={measureRef}
      position="absolute"
      top={0}
      left="50%"
      transform={`translate(-50%, calc(-100% - ${APPROX_PILL_ABOVE_CHROME_PX}px))`}
      zIndex={2}
      display={{ base: 'flex', lg: 'none' }}
      w="max-content"
      maxW="calc(100% - 2rem)"
      pointerEvents="none"
      css={{
        // A mouse's zoom buttons sit top right on a narrow window: keep clear.
        '@media (pointer: fine)': { maxWidth: 'calc(100% - 7.5rem)' },
      }}
    >
      <ApproximateAreaPill label={t.details.locationApproxPill} />
    </Box>
  )
}

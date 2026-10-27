'use client'

import { LuArrowLeft } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { IconButton } from '@ui'

import bag from '../../i11n.json'

/**
 * A public profile is not a nav page, so phones and tablets have no app header
 * or bottom nav: the page carries a way back (the header nav takes over from
 * lg). `cover`: over the hero's cover band. `page`: above a profile that is
 * still loading or could not be shown, where there is no cover.
 */
export function PublicProfileBack({
  onBack,
  placement,
}: {
  onBack: () => void
  placement: 'cover' | 'page'
}) {
  const t = useI11n(bag)

  return (
    <IconButton
      type="button"
      aria-label={t.back}
      variant="outline"
      bg="bg.surface"
      borderRadius="full"
      display={{ base: 'inline-flex', lg: 'none' }}
      {...(placement === 'cover'
        ? { position: 'absolute', top: 3, left: 3 }
        : { alignSelf: 'flex-start' })}
      onClick={onBack}
    >
      <LuArrowLeft aria-hidden />
    </IconButton>
  )
}

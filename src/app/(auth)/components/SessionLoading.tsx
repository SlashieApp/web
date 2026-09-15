'use client'

import { useI11n } from '@/i18n/useI11n'
import {
  BrandLoading,
  type BrandLoadingProps,
} from '@/ui/BrandLoading/BrandLoading'

import bag from './i11n.json'

export type SessionLoadingProps = Omit<
  BrandLoadingProps,
  'label' | 'trackLabel'
> & {
  label?: BrandLoadingProps['label']
  trackLabel?: BrandLoadingProps['trackLabel']
}

/** Auth-gated wait: branded splash with colocated session copy. */
export function SessionLoading({
  label,
  trackLabel,
  ref,
  ...rest
}: SessionLoadingProps) {
  const t = useI11n(bag)
  return (
    <BrandLoading
      ref={ref}
      label={label ?? t.sessionLoading}
      trackLabel={trackLabel ?? t.sessionLoadingTrack}
      {...rest}
    />
  )
}

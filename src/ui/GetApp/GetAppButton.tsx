'use client'

import { useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { isMobileOs, tryOpenApp } from '@/utils/nativeApp'

import { Button, type UiButtonProps } from '../Button/Button'
import { GetAppDialog } from './GetAppDialog'
import bag from './i11n.json'

/**
 * Get app: a phone or tablet tries the Slashie app and shows the coming-soon
 * popup if it doesn't open; a PC gets the popup with a QR code straight away.
 */
export function GetAppButton(props: Omit<UiButtonProps, 'onClick'>) {
  const t = useI11n(bag)
  const [dialog, setDialog] = useState<'closed' | 'pc' | 'phone'>('closed')

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        flexShrink={0}
        {...props}
        onClick={() => {
          if (isMobileOs(navigator.userAgent, navigator.maxTouchPoints)) {
            tryOpenApp(() => setDialog('phone'))
          } else {
            setDialog('pc')
          }
        }}
      >
        {t.getApp}
      </Button>
      <GetAppDialog
        open={dialog !== 'closed'}
        onOpenChange={(open) => {
          if (!open) setDialog('closed')
        }}
        showQr={dialog === 'pc'}
      />
    </>
  )
}

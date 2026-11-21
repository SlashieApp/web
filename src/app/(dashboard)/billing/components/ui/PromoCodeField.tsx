'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { LuCircleCheck } from 'react-icons/lu'

import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, Input, formControlRootProps } from '@ui'

import { PROMO_CODE_MAX, promoAppliedLine } from '../../helpers/promoCode'
import type { PromoCodeControl } from '../../helpers/usePromoCode'
import bag from '../../i11n.json'

export type PromoCodeFieldProps = {
  promo: PromoCodeControl
  /** Centred under a full-width button (Pricing), or from the start (Plan & billing). */
  align?: 'center' | 'start'
  /** While Checkout is starting. */
  disabled?: boolean
}

/**
 * "Have a code?" under the Slashie Pro button (FE-586; Ryan 21 Nov): a link
 * that opens a code field with Apply; once a code works, a line says what it
 * gives (and that it starts after the free trial), with Remove. The button
 * then starts Checkout with it. The Expo app's `PromoCodeField` is the same.
 */
export function PromoCodeField({
  promo,
  align = 'start',
  disabled = false,
}: PromoCodeFieldProps) {
  const t = useI11n(bag).promo
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'

  if (promo.applied) {
    return (
      <HStack
        data-promo-applied
        align="flex-start"
        justify={align === 'center' ? 'center' : 'flex-start'}
        gap={2}
        w="full"
      >
        <Text as="span" color="status.success.fg" mt="3px" flexShrink={0}>
          <LuCircleCheck aria-hidden size={16} />
        </Text>
        <Stack gap={0.5} minW={0}>
          <Text fontSize="sm" fontWeight={500} color="text.default">
            {promoAppliedLine(promo.applied, t, locale)}
          </Text>
          {promo.applied.startsAfterTrial ? (
            <Text fontSize="sm" color="text.muted">
              {t.afterTrial}
            </Text>
          ) : null}
        </Stack>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          color="text.link"
          flexShrink={0}
          mt="-8px"
          disabled={disabled}
          aria-label={formatMessage(t.removeLabel, {
            code: promo.applied.code,
          })}
          onClick={promo.remove}
        >
          {t.remove}
        </Button>
      </HStack>
    )
  }

  if (!promo.open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        color="text.link"
        alignSelf={align === 'center' ? 'center' : 'flex-start'}
        ml={align === 'center' ? undefined : -3}
        disabled={disabled}
        onClick={() => promo.setOpen(true)}
      >
        {t.link}
      </Button>
    )
  }

  return (
    <FormField
      label={t.label}
      labelProps={{ srOnly: true }}
      errorText={promo.problem ? t.problems[promo.problem] : undefined}
      w="full"
    >
      <HStack gap="form.inlineGap" align="stretch" w="full">
        <Input
          // Focus moves here from the link that opened it.
          autoFocus
          value={promo.text}
          maxLength={PROMO_CODE_MAX}
          placeholder={t.placeholder}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={disabled}
          onChange={(e) => promo.setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            void promo.apply()
          }}
          rootProps={{ ...formControlRootProps, flex: 1 }}
        />
        <Button
          type="button"
          variant="secondary"
          size="form"
          flexShrink={0}
          loading={promo.checking}
          disabled={disabled || promo.checking || !promo.text.trim()}
          onClick={() => void promo.apply()}
        >
          {t.apply}
        </Button>
      </HStack>
    </FormField>
  )
}

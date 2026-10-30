'use client'

import { LuShieldAlert } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { FormCheckbox, FormStack, InfoBar } from '@ui'

import { taskFieldError } from '../../../helpers/taskFieldError'
import bag from '../../../i11n.json'

export type CreateTaskConsentSectionProps = {
  accepted: boolean
  onChange: (accepted: boolean) => void
  /** Copy key from the form schema. */
  errorText?: string
}

/**
 * The allowed-tasks notice and the confirmation posting needs.
 *
 * Form spacing (FE-481): the notice and the checkbox are field groups, `fieldGap`
 * (20) apart; the checkbox is the shared `FormCheckbox` (its error 4 under the
 * row, announced, the 44px hit area growing into the gaps around it).
 */
export function CreateTaskConsentSection({
  accepted,
  onChange,
  errorText,
}: CreateTaskConsentSectionProps) {
  const t = useI11n(bag)
  const f = t.fields

  return (
    <FormStack>
      <InfoBar
        tone="warning"
        icon={<LuShieldAlert size={20} />}
        heading={f.allowedHeading}
        badgeLabel={f.allowedBadge}
      >
        {f.allowedBody}
      </InfoBar>
      <FormCheckbox
        checked={accepted}
        onCheckedChange={onChange}
        label={f.allowedConfirm}
        errorText={errorText ? taskFieldError(t.errors, errorText) : undefined}
      />
    </FormStack>
  )
}

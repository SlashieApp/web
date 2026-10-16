'use client'

import { useI11n } from '@/i18n/useI11n'

import {
  QUALIFICATION_RULES,
  SUGGESTED_QUALIFICATIONS,
} from '../../../helpers/workerSetupQualifications'
import bag from '../../../i11n.json'
import { WorkerSetupOptionalLabel } from '../shared/WorkerSetupOptionalBadge'
import { WorkerSetupChipsField } from './WorkerSetupChipsField'

export type WorkerSetupQualificationsInputProps = {
  value: string[]
  onChange: (qualifications: string[]) => void
}

/** Optional licences and trade cards, saved with the years of experience. */
export function WorkerSetupQualificationsInput({
  value,
  onChange,
}: WorkerSetupQualificationsInputProps) {
  const copy = useI11n(bag).qualifications
  return (
    <WorkerSetupChipsField
      label={<WorkerSetupOptionalLabel>{copy.label}</WorkerSetupOptionalLabel>}
      helperText={copy.helper}
      value={value}
      onChange={onChange}
      rules={QUALIFICATION_RULES}
      suggestions={SUGGESTED_QUALIFICATIONS}
      copy={copy}
    />
  )
}

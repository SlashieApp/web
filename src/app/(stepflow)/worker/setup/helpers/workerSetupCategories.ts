import { WorkerPrimaryCategory as WorkerPrimaryCategoryEnum } from '@codegen/schema'

import { formatMessage } from '@/i18n/loadPageI11n'
import { townOnly } from '@/utils/taskLocationDisplay'

import type bag from '../i11n.json'
import type { WorkerSetupFormState } from './workerSetupFormState'

type SetupCopy = (typeof bag)['en']

/** Trade names, headline nouns and suggested skills (setup bag `trades`). */
export type WorkerTradesCopy = SetupCopy['trades']
export type WorkerTradeSlug = keyof WorkerTradesCopy

/**
 * The worker's main trade, saved as the `Worker.primaryCategory` enum. Copy
 * for each lives in the setup bag under the slug.
 */
export type WorkerPrimaryCategory = {
  slug: WorkerTradeSlug
  enum: WorkerPrimaryCategoryEnum
}

export const WORKER_PRIMARY_CATEGORIES: readonly WorkerPrimaryCategory[] = [
  { slug: 'handyman', enum: WorkerPrimaryCategoryEnum.Handyman },
  {
    slug: 'furniture-assembly',
    enum: WorkerPrimaryCategoryEnum.FurnitureAssembly,
  },
  { slug: 'mounting', enum: WorkerPrimaryCategoryEnum.MountingInstallation },
  { slug: 'plumbing', enum: WorkerPrimaryCategoryEnum.Plumbing },
  { slug: 'electrical', enum: WorkerPrimaryCategoryEnum.Electrical },
  { slug: 'carpentry', enum: WorkerPrimaryCategoryEnum.Carpentry },
  { slug: 'painting', enum: WorkerPrimaryCategoryEnum.Painting },
  { slug: 'cleaning', enum: WorkerPrimaryCategoryEnum.Cleaning },
  { slug: 'gardening', enum: WorkerPrimaryCategoryEnum.Gardening },
  { slug: 'removals', enum: WorkerPrimaryCategoryEnum.Removals },
  { slug: 'delivery', enum: WorkerPrimaryCategoryEnum.DeliveryErrands },
  { slug: 'other', enum: WorkerPrimaryCategoryEnum.Other },
]

export function categoryBySlug(
  slug: string | null | undefined,
): WorkerPrimaryCategory | null {
  if (!slug) return null
  return WORKER_PRIMARY_CATEGORIES.find((c) => c.slug === slug) ?? null
}

/** Wire → form: GraphQL enum to the FE slug ('' when unset). */
export function categorySlugFromEnum(
  value: WorkerPrimaryCategoryEnum | null | undefined,
): WorkerTradeSlug | '' {
  if (!value) return ''
  return WORKER_PRIMARY_CATEGORIES.find((c) => c.enum === value)?.slug ?? ''
}

/** Form → wire: FE slug to the GraphQL enum (undefined when unset). */
export function categoryEnumFromSlug(
  slug: string,
): WorkerPrimaryCategoryEnum | undefined {
  return categoryBySlug(slug)?.enum
}

/** A saved trade's name in the reader's language, e.g. on the profile. */
export function categoryLabelFromEnum(
  value: WorkerPrimaryCategoryEnum | null | undefined,
  trades: WorkerTradesCopy,
): string | null {
  const slug = categorySlugFromEnum(value)
  return slug ? trades[slug].label : null
}

/** Skill chips to suggest for a trade; none until one is chosen. */
export function categorySkills(
  slug: string,
  trades: WorkerTradesCopy,
): readonly string[] {
  const category = categoryBySlug(slug)
  return category ? trades[category.slug].skills : []
}

/**
 * A headline from what the worker has told us, e.g. "Plumber with 8 years
 * experience", else "Plumber serving Watford" (the town only), else "Plumber
 * for local jobs". Null until a trade is chosen.
 */
export function suggestedHeadline(
  input: Pick<
    WorkerSetupFormState,
    'primaryCategory' | 'yearsExperience' | 'locationName'
  >,
  copy: Pick<SetupCopy, 'trades' | 'headlines'>,
): string | null {
  const category = categoryBySlug(input.primaryCategory)
  if (!category) return null
  const noun = copy.trades[category.slug].noun
  const years = Number.parseInt(input.yearsExperience.trim(), 10)
  if (years === 1) return formatMessage(copy.headlines.oneYear, { noun })
  if (years > 1) return formatMessage(copy.headlines.years, { noun, years })
  const area = townOnly(input.locationName)
  if (area) return formatMessage(copy.headlines.area, { noun, area })
  return formatMessage(copy.headlines.local, { noun })
}

/** Opening the profile screen without a headline: start from the suggestion. */
export function prefillHeadline(
  form: WorkerSetupFormState,
  copy: Pick<SetupCopy, 'trades' | 'headlines'>,
): WorkerSetupFormState {
  if (form.tagline.trim()) return form
  const suggestion = suggestedHeadline(form, copy)
  return suggestion ? { ...form, tagline: suggestion } : form
}

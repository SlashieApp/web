import { WorkerPrimaryCategory as WorkerPrimaryCategoryEnum } from '@codegen/schema'

/**
 * Primary-trade taxonomy for worker setup (ticket 1.1), persisted via the
 * dedicated `Worker.primaryCategory` enum (BE shipped 2026-07-13). The BE is
 * rollout-tolerant: legacy workers whose `skills[0]` is a trade label are
 * inferred + stripped server-side, so the FE reads `primaryCategory` only.
 */
export type WorkerPrimaryCategory = {
  /** Stable FE identifier (lowercase form of the GraphQL enum). */
  slug: string
  /** GraphQL enum value sent on the `services.skills` payload. */
  enum: WorkerPrimaryCategoryEnum
  /** Tile + display label. */
  label: string
  /** Noun used to compose the suggested professional headline. */
  headlineNoun: string
  /** Skills-chip suggestions seeded when this category is selected. */
  suggestedSkills: readonly string[]
}

export const WORKER_PRIMARY_CATEGORIES: readonly WorkerPrimaryCategory[] = [
  {
    slug: 'handyman',
    enum: WorkerPrimaryCategoryEnum.Handyman,
    label: 'Handyman',
    headlineNoun: 'Handyman',
    suggestedSkills: [
      'Home Repairs',
      'Furniture Assembly',
      'TV Mounting',
      'Shelf Mounting',
      'Hang Pictures',
      'Drywall Repairs',
      'Curtains & Blinds',
      'Light Installation',
    ],
  },
  {
    slug: 'furniture-assembly',
    enum: WorkerPrimaryCategoryEnum.FurnitureAssembly,
    label: 'Furniture Assembly',
    headlineNoun: 'Furniture assembly specialist',
    suggestedSkills: [
      'Flat-pack Assembly',
      'IKEA Furniture',
      'Bed Assembly',
      'Desk Assembly',
      'Wardrobe Fitting',
      'Office Furniture',
      'Bookshelf Assembly',
      'Sofa Assembly',
      'Furniture Disassembly',
    ],
  },
  {
    slug: 'mounting',
    enum: WorkerPrimaryCategoryEnum.MountingInstallation,
    label: 'Mounting & Installation',
    headlineNoun: 'Mounting & installation specialist',
    suggestedSkills: [
      'TV Mounting',
      'Shelf Mounting',
      'Light Installation',
      'Hang Pictures',
      'Curtains & Blinds',
      'Christmas Lights',
    ],
  },
  {
    slug: 'plumbing',
    enum: WorkerPrimaryCategoryEnum.Plumbing,
    label: 'Plumbing',
    headlineNoun: 'Plumber',
    suggestedSkills: [
      'Tap Repairs',
      'Leak Fixes',
      'Toilet Installs',
      'Radiator Bleeding',
      'Shower Fitting',
      'Waste Unblocking',
    ],
  },
  {
    slug: 'electrical',
    enum: WorkerPrimaryCategoryEnum.Electrical,
    label: 'Electrical Work',
    headlineNoun: 'Electrician',
    suggestedSkills: [
      'Light Fittings',
      'Socket Replacement',
      'Fault Finding',
      'Smart Home Setup',
      'EV Charger Install',
      'Fuse Boards',
    ],
  },
  {
    slug: 'carpentry',
    enum: WorkerPrimaryCategoryEnum.Carpentry,
    label: 'Carpentry',
    headlineNoun: 'Carpenter',
    suggestedSkills: [
      'Custom Shelving',
      'Door Hanging',
      'Skirting Boards',
      'Decking',
      'Kitchen Fitting',
      'Wardrobes',
    ],
  },
  {
    slug: 'painting',
    enum: WorkerPrimaryCategoryEnum.Painting,
    label: 'Painting',
    headlineNoun: 'Painter & decorator',
    suggestedSkills: [
      'Interior Painting',
      'Exterior Painting',
      'Wallpapering',
      'Plaster Repairs',
      'Fence Staining',
      'Feature Walls',
    ],
  },
  {
    slug: 'cleaning',
    enum: WorkerPrimaryCategoryEnum.Cleaning,
    label: 'Cleaning',
    headlineNoun: 'Cleaner',
    suggestedSkills: [
      'House Cleaning',
      'Deep Cleaning',
      'End Of Tenancy Cleaning',
      'Move-in Cleaning',
      'Office Cleaning',
      'Spring Cleaning',
      'Airbnb Cleaning',
      'Oven Cleaning',
      'Pressure Washing',
      'Car Washing',
      'Laundry Help',
    ],
  },
  {
    slug: 'gardening',
    enum: WorkerPrimaryCategoryEnum.Gardening,
    label: 'Gardening',
    headlineNoun: 'Gardener',
    suggestedSkills: [
      'Lawn Mowing',
      'Lawn Care',
      'Hedge Trimming',
      'Tree Trimming & Removal',
      'Landscaping',
      'Leaf Raking & Removal',
      'Roof & Gutter Cleaning',
      'Garden Tidy-up',
    ],
  },
  {
    slug: 'removals',
    enum: WorkerPrimaryCategoryEnum.Removals,
    label: 'Removals',
    headlineNoun: 'Removals specialist',
    suggestedSkills: [
      'House Removals',
      'Man With A Van',
      'Furniture Removal',
      'Sofa Removal',
      'Packing',
      'Unpacking',
      'Heavy Lifting',
      'Furniture Delivery',
      'Rubbish Removal',
      'Pool Table Moving',
    ],
  },
  {
    slug: 'delivery',
    enum: WorkerPrimaryCategoryEnum.DeliveryErrands,
    label: 'Delivery & Errands',
    headlineNoun: 'Delivery & errands specialist',
    suggestedSkills: [
      'Delivery Service',
      'Shopping Services',
      'Food Shopping',
      'Run Errands',
      'Queuing',
      'Collection & Drop-off',
      'Returning Items',
      'Waiting For Deliveries',
      'Donation Drop-offs',
    ],
  },
  {
    slug: 'other',
    enum: WorkerPrimaryCategoryEnum.Other,
    label: 'Other',
    headlineNoun: 'Local specialist',
    suggestedSkills: [],
  },
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
): string {
  if (!value) return ''
  return WORKER_PRIMARY_CATEGORIES.find((c) => c.enum === value)?.slug ?? ''
}

/** Form → wire: FE slug to the GraphQL enum (undefined when unset). */
export function categoryEnumFromSlug(
  slug: string,
): WorkerPrimaryCategoryEnum | undefined {
  return categoryBySlug(slug)?.enum
}

/** Display label for a saved enum value, e.g. profile hero headline. */
export function categoryLabelFromEnum(
  value: WorkerPrimaryCategoryEnum | null | undefined,
): string | null {
  if (!value) return null
  return WORKER_PRIMARY_CATEGORIES.find((c) => c.enum === value)?.label ?? null
}

/**
 * Suggested professional headline from what the worker has told us so far
 * (ticket 1.2), e.g. "Handyman with 8 years experience" or
 * "Plumber serving Watford". Null until a category is chosen.
 */
export function suggestedHeadline(input: {
  primaryCategory: string
  yearsExperience: string
  locationName: string
}): string | null {
  const category = categoryBySlug(input.primaryCategory)
  if (!category) return null
  const years = Number.parseInt(input.yearsExperience.trim(), 10)
  if (Number.isInteger(years) && years > 0) {
    return `${category.headlineNoun} with ${years} year${years === 1 ? '' : 's'} experience`
  }
  const area = input.locationName.trim()
  if (area) return `${category.headlineNoun} serving ${area}`
  return `${category.headlineNoun} for local jobs`
}

/**
 * True when the current headline is empty or one we composed earlier — those
 * are safe to replace when the category/experience answers change. A headline
 * the worker typed themselves is never overwritten.
 */
export function canReplaceHeadline(current: string): boolean {
  const cleaned = current.trim()
  if (!cleaned) return true
  return WORKER_PRIMARY_CATEGORIES.some(
    (c) =>
      cleaned.startsWith(`${c.headlineNoun} with `) ||
      cleaned.startsWith(`${c.headlineNoun} serving `) ||
      cleaned === `${c.headlineNoun} for local jobs`,
  )
}

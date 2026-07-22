export const enMessages = {
  common: {
    ctas: {
      browseTasks: 'Browse tasks',
      becomeWorker: 'Become a worker',
      getStarted: 'Get started',
      logIn: 'Log in',
      postTask: 'Post a task',
      seeHowItWorks: 'See how it works',
      viewPricing: 'View pricing',
    },
  },
  header: {
    skipToContent: 'Skip to content',
    menuIconTitle: 'Menu',
    menuTitle: 'Menu',
    openMenu: 'Open menu',
    languageLabel: 'Language',
    languages: {
      en: 'EN',
      zhTW: '繁中',
    },
    nav: {
      pricing: 'Pricing',
      about: 'About',
    },
  },
  landing: {
    metadata: {
      title: 'Slashie — Get local help with trusted quotes',
      description:
        'Post a task, get quotes from nearby workers, and pay the worker directly. Slashie takes no cut of the job.',
    },
    hero: {
      eyebrow: 'Local help, on the map',
      heading: 'Get local help. Hire with confidence.',
      body: 'Post a task, get quotes from nearby workers, pick who you want. You pay the worker directly — Slashie takes no cut of the job.',
      trustChips: ['No job fee', 'Local workers', 'Pay directly'],
    },
    howItWorks: {
      heading: 'How it works',
      body: 'Three steps from task to done.',
      steps: [
        {
          step: '01',
          title: 'Post',
          body: 'Tell workers what you need, when, and where.',
        },
        {
          step: '02',
          title: 'Compare quotes',
          body: 'See prices, profiles, reviews, and worker details.',
        },
        {
          step: '03',
          title: 'Hire & pay directly',
          body: 'Choose a worker and settle payment between you.',
        },
      ],
    },
    audience: {
      heading: 'For customers and workers',
      customer: {
        title: 'For customers',
        items: [
          'Post tasks for free',
          'Compare quotes from nearby workers',
          'Choose by price, profile, and reviews',
        ],
      },
      worker: {
        title: 'For workers',
        items: [
          'Find real tasks on the map',
          'Send quotes and win work nearby',
          'Keep the job price you agree with the customer',
        ],
      },
    },
    trust: {
      points: [
        'No platform cut from the job',
        'Payment stays between customer and worker',
        'Profiles, reviews, and proof of past work',
        'Local tasks, local workers, clear quotes',
      ],
    },
    pricingTeaser: {
      heading: 'Simple pricing',
      body: 'Customers use Slashie for free. Workers get free quotes each month, then can subscribe for unlimited quoting.',
      freePlanLabel: 'Workers — Free',
      freeHeadline: '{count} quotes a month',
      freeBody: 'Browse tasks and send quotes on the free tier.',
      unlimitedHeadlineFallback: 'Unlimited quotes',
      unlimitedSublineFallback: 'Unlimited quotes for one subscription',
      unlimitedSublineWithPrice: 'Then {priceLine} · unlimited quotes',
    },
    finalCta: {
      heading: 'Ready to get local help?',
      body: 'Post a task or start quoting as a worker. It only takes a minute.',
    },
  },
  pricing: {
    metadata: {
      title: 'Pricing | Slashie',
      description:
        'Customers use Slashie for free. Workers can send free quotes each month or subscribe to Slashie Unlimited. Job payments stay between customer and worker.',
    },
    header: {
      heading: 'Simple plans. Clear quotes.',
      body: 'Customers post for free. Workers start free, then upgrade when they want unlimited quotes.',
    },
    error: {
      eyebrow: 'Pricing',
      heading: 'Pricing unavailable',
      body: 'We could not load plan details right now. Refresh the page or try again in a few minutes.',
      paymentNote:
        'Job payments are always arranged directly between customers and workers outside Slashie.',
    },
    trialBanner: {
      defaultBody: 'Try Slashie Unlimited free. Cancel anytime.',
      bodyWithTrial: 'Try Slashie Unlimited {trial}. Cancel anytime.',
      badgeFallback: 'FREE TRIAL',
    },
    plans: {
      currentPlan: 'Current plan',
      getStarted: 'Get started',
      setUpWorkerProfile: 'Set up worker profile',
      upgrade: 'Upgrade',
      free: {
        title: 'Worker Free',
        subtitle: 'Start finding tasks',
        price: '£0',
        priceSuffix: 'Forever',
        badge: '{count} QUOTES / MONTH',
        features: [
          'Browse tasks on the map',
          'Send up to {count} quotes per month',
          'Show your worker profile and reviews',
          'Coordinate task details in Slashie',
          'Upgrade anytime',
        ],
      },
      unlimited: {
        descriptionFallback: 'For active workers',
        trialFallback: 'Free trial',
        afterTrialLine: '{price} / {interval} after trial',
        intervals: {
          month: 'month',
          year: 'year',
        },
        badge: 'UNLIMITED QUOTES',
        ribbon: 'BEST FOR ACTIVE WORKERS',
        features: [
          'Unlimited quotes every month',
          'Map-first task discovery',
          'Full platform access',
          'Manage billing and cancel anytime',
          'Keep the same worker profile and reputation',
        ],
      },
    },
    detailsLink: 'See all plan details >',
    faq: {
      heading: 'Frequently asked questions',
      items: [
        {
          question: 'What am I paying for?',
          answer:
            'Slashie Unlimited is a subscription for workers who want unlimited quotes. It is not a fee for completing tasks or receiving job payment.',
        },
        {
          question: 'Do customers pay Slashie?',
          answer:
            'No. Customers post tasks, compare quotes, and accept a worker for free in the current MVP.',
        },
        {
          question: 'How do workers get paid?',
          answer:
            'The customer and worker arrange payment directly outside Slashie. Slashie does not hold, process, or release job money.',
        },
        {
          question: 'What happens after the trial?',
          answer:
            'After your trial ends, Slashie Unlimited continues at {price} per month unless you cancel before the trial period ends.',
        },
        {
          question: 'Can I cancel?',
          answer:
            'Yes. You can cancel from your worker plan page when billing management is available. Canceling stops future subscription charges.',
        },
      ],
    },
    disclaimer: {
      body: 'Job payments are arranged directly between customers and workers. Slashie subscription is for platform access only.',
      terms: 'Terms apply.',
    },
  },
} as const

type WidenMessageValue<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly WidenMessageValue<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: WidenMessageValue<T[Key]> }
      : T

export type Messages = WidenMessageValue<typeof enMessages>

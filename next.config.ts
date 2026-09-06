import type { NextConfig } from 'next'

/** First-party PostHog reverse-proxy host (same Vercel project as www). */
const POSTHOG_PROXY_HOST = 'e.slashie.app'

const nextConfig: NextConfig = {
  // PostHog capture paths use trailing slashes (e.g. /e/); do not 308-strip them.
  skipTrailingSlashRedirect: true,
  experimental: {
    // Same-document App Router transitions via React <ViewTransition>.
    // The CSS `@view-transition { navigation: auto }` form is cross-document
    // only and does nothing here.
    viewTransition: true,
  },
  turbopack: {
    rules: {
      '*.gql': {
        loaders: ['graphql-tag/loader'],
        as: '*.js',
      },
      '*.graphql': {
        loaders: ['graphql-tag/loader'],
        as: '*.js',
      },
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(gql|graphql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    })
    return config
  },
  /**
   * First-party PostHog reverse proxy for EU cloud.
   * Only active on `e.slashie.app` so www/app routes are untouched.
   * @see https://posthog.com/docs/advanced/proxy/nextjs
   */
  async rewrites() {
    const onProxyHost = {
      type: 'host' as const,
      value: POSTHOG_PROXY_HOST,
    }
    return [
      {
        source: '/static/:path*',
        has: [onProxyHost],
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/array/:path*',
        has: [onProxyHost],
        destination: 'https://eu-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/:path*',
        has: [onProxyHost],
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ]
  },
  async redirects() {
    // Non-default locale keeps its slug; English destinations are unprefixed.
    const zhHk = 'zh-hk'
    return [
      // Legacy browse surfaces merged into the unified map-first /search.
      // Exact-match only: /tasks/:slug and /workers/:slug stay untouched.
      {
        source: `/${zhHk}/tasks`,
        destination: `/${zhHk}/search?mode=tasks`,
        permanent: false,
      },
      {
        source: '/en/tasks',
        destination: '/search?mode=tasks',
        permanent: false,
      },
      {
        source: '/tasks',
        destination: '/search?mode=tasks',
        permanent: false,
      },
      {
        source: `/${zhHk}/task/:slug`,
        destination: `/${zhHk}/tasks/:slug`,
        permanent: true,
      },
      {
        source: '/en/task/:slug',
        destination: '/tasks/:slug',
        permanent: true,
      },
      {
        source: '/task/:slug',
        destination: '/tasks/:slug',
        permanent: true,
      },
      {
        source: `/${zhHk}/task/:slug/quote`,
        destination: `/${zhHk}/tasks/:slug/quote`,
        permanent: true,
      },
      {
        source: '/en/task/:slug/quote',
        destination: '/tasks/:slug/quote',
        permanent: true,
      },
      {
        source: '/task/:slug/quote',
        destination: '/tasks/:slug/quote',
        permanent: true,
      },
      {
        source: `/${zhHk}/requests/:id/order`,
        destination: `/${zhHk}/tasks/:id#task-order`,
        permanent: true,
      },
      {
        source: '/en/requests/:id/order',
        destination: '/tasks/:id#task-order',
        permanent: true,
      },
      {
        source: '/requests/:id/order',
        destination: '/tasks/:id#task-order',
        permanent: true,
      },
      {
        source: `/${zhHk}/tasks/:slug/order`,
        destination: `/${zhHk}/tasks/:slug#task-order`,
        permanent: true,
      },
      {
        source: '/en/tasks/:slug/order',
        destination: '/tasks/:slug#task-order',
        permanent: true,
      },
      {
        source: '/tasks/:slug/order',
        destination: '/tasks/:slug#task-order',
        permanent: true,
      },
      {
        source: `/${zhHk}/jobs`,
        destination: `/${zhHk}/quotes`,
        permanent: true,
      },
      {
        source: '/en/jobs',
        destination: '/quotes',
        permanent: true,
      },
      {
        source: '/jobs',
        destination: '/quotes',
        permanent: true,
      },
      {
        source: `/${zhHk}/jobs/:path*`,
        destination: `/${zhHk}/quotes/:path*`,
        permanent: true,
      },
      {
        source: '/en/jobs/:path*',
        destination: '/quotes/:path*',
        permanent: true,
      },
      {
        source: '/jobs/:path*',
        destination: '/quotes/:path*',
        permanent: true,
      },
      {
        source: `/${zhHk}/worker/plan`,
        destination: `/${zhHk}/billing`,
        permanent: true,
      },
      {
        source: '/en/worker/plan',
        destination: '/billing',
        permanent: true,
      },
      {
        source: '/worker/plan',
        destination: '/billing',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.slashie.app',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

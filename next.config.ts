import type { NextConfig } from 'next'

/** First-party PostHog reverse-proxy host (same Vercel project as www). */
const POSTHOG_PROXY_HOST = 'e.slashie.app'

const nextConfig: NextConfig = {
  // PostHog capture paths use trailing slashes (e.g. /e/); do not 308-strip them.
  skipTrailingSlashRedirect: true,
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
    const locale = ':locale(en|zh-hk)'
    return [
      // Legacy browse surfaces merged into the unified map-first /search.
      // Exact-match only: /tasks/:slug and /workers/:slug stay untouched.
      // Locale-prefixed variants keep the `/en` / `/zh-hk` slug.
      {
        source: `/${locale}/tasks`,
        destination: `/${locale}/search?mode=tasks`,
        permanent: false,
      },
      {
        source: '/tasks',
        destination: '/en/search?mode=tasks',
        permanent: false,
      },
      {
        source: `/${locale}/workers`,
        destination: `/${locale}/search?mode=workers`,
        permanent: false,
      },
      {
        source: '/workers',
        destination: '/en/search?mode=workers',
        permanent: false,
      },
      {
        source: `/${locale}/task/:slug`,
        destination: `/${locale}/tasks/:slug`,
        permanent: true,
      },
      {
        source: '/task/:slug',
        destination: '/en/tasks/:slug',
        permanent: true,
      },
      {
        source: `/${locale}/task/:slug/quote`,
        destination: `/${locale}/tasks/:slug/quote`,
        permanent: true,
      },
      {
        source: '/task/:slug/quote',
        destination: '/en/tasks/:slug/quote',
        permanent: true,
      },
      {
        source: `/${locale}/requests/:id/order`,
        destination: `/${locale}/tasks/:id#task-order`,
        permanent: true,
      },
      {
        source: '/requests/:id/order',
        destination: '/en/tasks/:id#task-order',
        permanent: true,
      },
      {
        source: `/${locale}/tasks/:slug/order`,
        destination: `/${locale}/tasks/:slug#task-order`,
        permanent: true,
      },
      {
        source: '/tasks/:slug/order',
        destination: '/en/tasks/:slug#task-order',
        permanent: true,
      },
      {
        source: `/${locale}/jobs`,
        destination: `/${locale}/quotes`,
        permanent: true,
      },
      {
        source: '/jobs',
        destination: '/en/quotes',
        permanent: true,
      },
      {
        source: `/${locale}/jobs/:path*`,
        destination: `/${locale}/quotes/:path*`,
        permanent: true,
      },
      {
        source: '/jobs/:path*',
        destination: '/en/quotes/:path*',
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

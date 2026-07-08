import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
  async redirects() {
    return [
      // Legacy browse surfaces merged into the unified map-first /search.
      // Exact-match only: /tasks/:slug and /workers/:slug stay untouched.
      {
        source: '/tasks',
        destination: '/search?mode=tasks',
        permanent: false,
      },
      {
        source: '/workers',
        destination: '/search?mode=workers',
        permanent: false,
      },
      {
        source: '/task/:slug',
        destination: '/tasks/:slug',
        permanent: true,
      },
      {
        source: '/task/:slug/quote',
        destination: '/tasks/:slug/quote',
        permanent: true,
      },
      {
        source: '/requests/:id/order',
        destination: '/tasks/:id#task-order',
        permanent: true,
      },
      {
        source: '/tasks/:slug/order',
        destination: '/tasks/:slug#task-order',
        permanent: true,
      },
      {
        source: '/jobs',
        destination: '/quotes',
        permanent: true,
      },
      {
        source: '/jobs/:path*',
        destination: '/quotes/:path*',
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

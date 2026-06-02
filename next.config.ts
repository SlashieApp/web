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
  async redirects() {
    return [
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
    ],
  },
}

export default nextConfig

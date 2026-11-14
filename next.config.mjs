import SentryNextConfig from '@sentry/nextjs/config';

const { withSentryConfig } = SentryNextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/avatars/**' }],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
});

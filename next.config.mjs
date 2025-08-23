/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  output: 'standalone',
  // Skip static generation when CLERK_PUBLISHABLE_KEY is not available during build
  experimental: {
    skipTrailingSlashRedirect: true,
  },
  // Force dynamic rendering for all pages
  ...(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? {} : {
    trailingSlash: false,
  }),
}

export default nextConfig
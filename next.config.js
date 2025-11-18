/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;

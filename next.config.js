/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    dirs: ['src'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' }
        ],
      },
    ]
  },
}

module.exports = nextConfig
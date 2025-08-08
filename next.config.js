/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable and enabled by default in Next.js 15
  output: 'export',
  trailingSlash: true,
  basePath: '/standup-tracker',
  assetPrefix: '/standup-tracker/',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig

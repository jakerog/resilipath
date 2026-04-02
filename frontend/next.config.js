const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable in dev for offline testing
  fallbacks: {
    document: '/offline', // Future placeholder
  }
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}
}

module.exports = withPWA(nextConfig)

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Enable in dev for offline testing
  fallbacks: {
    document: '/offline', // Future placeholder
  },
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'firestore-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60 // 24 hours
          }
        }
      }
    ]
  }
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}
}

module.exports = withPWA(nextConfig)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [new URL('https://flagcdn.com/**')],
  },
}
module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // ─── API Proxy ─────────────────────────────────────────────────────────────
  // Forwards all /api/* requests from the browser to the Express backend.
  // This keeps both on the same origin (localhost:3000), making httpOnly
  // cookies work with no CORS configuration needed.
  // In production: change the destination to your deployed backend URL.
  async rewrites() {
    return [
      {
        source:      '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
}

export default nextConfig

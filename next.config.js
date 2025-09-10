/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
    return [
      { source: '/api/:path*', destination: `${base}/:path*` },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static Site Generation is the default with App Router
  // Individual pages opt in to dynamic rendering where needed

  images: {
    // Allow Supabase Storage URLs for coach photos and client logos
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Next.js automatically serves AVIF → WebP → JPEG via the <Image> component
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mfucmzhbcrvmgrexazdw.supabase.co',
        pathname: '/storage/v1/object/public/images/uploads/**',
      },
    ],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [],
  },
  // Disable dev indicators that show build status notifications
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Removed typescript.ignoreBuildErrors - we want to catch TypeScript errors
  // Removed eslint.ignoreDuringBuilds - we want to catch linting issues
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip build errors from prerendering pages that require env vars
  // These pages are all dynamic (require auth) so static generation is not needed
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;

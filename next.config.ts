import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the on-screen dev indicator; its bottom-left badge overlapped the
  // sidebar footer card and read as the sidebar spilling outside its width.
  // Compile/runtime errors are still surfaced by Next.
  devIndicators: false,
  async redirects() {
    return [
      { source: '/knowledge-base', destination: '/knowledge/sources', permanent: false },
      { source: '/upload', destination: '/knowledge/upload', permanent: false },
      { source: '/dashboard', destination: '/operations/performance', permanent: false },
      { source: '/evaluation', destination: '/operations/testing', permanent: false },
      { source: '/consumption', destination: '/operations/consumption', permanent: false },
      { source: '/configuration', destination: '/administration/configuration', permanent: false },
      { source: '/users', destination: '/administration/users', permanent: false },
    ];
  },
};

export default nextConfig;

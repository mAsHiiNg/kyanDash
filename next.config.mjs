/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,

  // ✅ Modern config for Next.js 15+
  turbopack: {},

  // ✅ Enable static export (no Node.js server needed)
  output: "export",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ✅ Optional: allow development origins if needed for Supabase / API calls
  allowedDevOrigins: ["*.daytona.work", "*.softgen.dev"],
};

export default nextConfig;

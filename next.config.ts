import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization settings with security restrictions
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "npguberkdninaucofupy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/**", // Strict pathname to prevent abuse
      },
      {
        protocol: "https",
        hostname: "caption-studio-back.onrender.com",
        port: "",
        pathname: "/uploads/**", // Only allow uploads directory
      },
      {
        protocol: "https",
        hostname: "caption-studio-back-test.onrender.com",
        port: "",
        pathname: "/**", // Test environment - more permissive
      },
    ],
    // Security settings for image optimization
    dangerouslyAllowSVG: false, // Disable SVG support to prevent XSS
    contentDispositionType: "attachment", // Force download for unsafe content
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
    formats: ["image/webp"], // Use modern formats
  },

  // Strict mode for better error detection
  reactStrictMode: true,

  // Disable X-Powered-By header to hide technology stack
  poweredByHeader: false,

  // Compiler options for optimization
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Security headers (additional to middleware)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const contentSecurityPolicy = [
  `default-src 'self'`,
  `img-src 'self' blob: data: https://res.cloudinary.com https://*.supabase.co`,
  `media-src 'self' blob: https://res.cloudinary.com https://*.supabase.co`,
  `font-src 'self' https://fonts.gstatic.com`,
  `style-src 'self' 'unsafe-inline'`,
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : ` 'unsafe-eval'`}`,
  `connect-src 'self' https://api.stripe.com https://merchant.onboarding.stripe.com https://*.easypaisa.com.pk https://api.cloudinary.com https://*.supabase.co wss://*.supabase.co${
    process.env.NODE_ENV === "production" ? "" : " http://127.0.0.1:7360 http://localhost:7360"
  }`,
  `frame-src https://js.stripe.com https://hooks.stripe.com`,
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  /** Avoid broken relative `vendor-chunks/zustand.js` on server after incremental builds. */
  serverExternalPackages: ["zustand"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy.replace(/\s{2,}/g, " "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

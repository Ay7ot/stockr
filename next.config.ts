import type { NextConfig } from "next";
import withPWA from "next-pwa";

/** Exact host from env (when set at build time). */
function supabaseHostFromEnv():
  | { protocol: "https"; hostname: string; pathname: string }
  | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    const hostname = new URL(url).hostname;
    return {
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return undefined;
  }
}

/**
 * Fallback: any Supabase project host. Needed when env wasn’t available at
 * build time or hostname must match `*.supabase.co` for the image optimizer.
 */
const supabaseWildcardPattern = {
  protocol: "https" as const,
  hostname: "*.supabase.co",
  pathname: "/storage/v1/object/public/**",
};

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: ["@tanstack/react-query"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    // Lets the optimizer fetch when DNS returns NAT64 IPv6 (64:ff9b::…) etc.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      supabaseWildcardPattern,
      ...(supabaseHostFromEnv() ? [supabaseHostFromEnv()!] : []),
    ],
  },
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
});

// @ts-ignore - next-pwa types incompatible with Next.js 16
export default pwaConfig(nextConfig);

import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { QueryProvider } from "@/components/query-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "Stockr — Inventory & Sales Tracker",
    template: "%s | Stockr",
  },
  description: "Smart inventory and sales tracking for gadget businesses. Track stock, record sales, manage staff, and view real-time reports from anywhere.",
  keywords: [
    "inventory management",
    "sales tracking",
    "gadget business",
    "stock management",
    "point of sale",
    "business analytics",
    "inventory software",
    "sales reports",
    "mobile inventory",
    "retail management",
  ],
  authors: [{ name: "Stockr" }],
  creator: "Stockr",
  publisher: "Stockr",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Stockr — Smart Inventory & Sales Tracking",
    description: "Track inventory, record sales, and view daily reports for your gadget business. Mobile-first, intuitive, and powerful.",
    siteName: "Stockr",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stockr - Inventory & Sales Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockr — Smart Inventory & Sales Tracking",
    description: "Track inventory, record sales, and view daily reports for your gadget business.",
    images: ["/og-image.png"],
    creator: "@stockr",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon-512.png",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stockr",
  },
  applicationName: "Stockr",
  category: "business",
  classification: "Business Application",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Stockr",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Smart inventory and sales tracking for gadget businesses. Track stock, record sales, manage staff, and view real-time reports from anywhere.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    },
    "featureList": [
      "Real-time inventory tracking",
      "Sales recording and management",
      "Staff management and permissions",
      "Daily and monthly reports",
      "Mobile-first responsive design",
      "Serialized device tracking (IMEI/Serial numbers)"
    ]
  };

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

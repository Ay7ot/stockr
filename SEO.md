# SEO Implementation Guide - Stockr

This document outlines all SEO implementations for the Stockr inventory management application.

## Overview

Stockr has been optimized for search engines with comprehensive metadata, social sharing capabilities, and structured data. Since this is a private business application, we've configured it to prevent indexing while maintaining proper SEO structure for potential public marketing pages.

## Assets Created

### Icons & Images

All icons and images are located in the `/public` directory and `/app` directory (for Next.js metadata convention):

1. **App Icons**
   - `icon-512.png` (512×512) - Main app icon, PWA icon
   - `apple-touch-icon.png` (180×180) - iOS home screen icon
   - `app/icon.png` - Next.js metadata file convention
   - `app/apple-icon.png` - Next.js metadata file convention

2. **Favicons**
   - `favicon.ico` - Legacy favicon
   - `favicon-16x16.png` - Small favicon
   - `favicon-32x32.png` - Standard favicon

3. **Social Media Images**
   - `og-image.png` (1200×630) - Open Graph image for Facebook, LinkedIn
   - `app/opengraph-image.png` - Next.js metadata file convention
   - `app/twitter-image.png` (1200×630) - Twitter Card image

All images feature:
- Purple to blue gradient branding (#8b5cf6 to #3b82f6)
- Clean, modern design
- Box/inventory iconography
- Professional typography

## Configuration Files

### 1. Manifest.json (`/public/manifest.json`)

PWA (Progressive Web App) configuration:
- App name: "Stockr - Inventory & Sales Tracker"
- Theme color: #8b5cf6 (purple)
- Display: standalone (app-like experience)
- Orientation: portrait (mobile-first)
- Categories: business, productivity, finance

**Features:**
- Allows users to install Stockr as a native-like app on mobile devices
- Provides app icon on home screen
- Enables standalone mode without browser UI

### 2. Robots.txt (`/public/robots.txt`)

Search engine crawling rules:
```
User-agent: *
Disallow: /
```

**Purpose:** Blocks all search engines from indexing the application since it contains sensitive business data. This is appropriate for a private business tool.

**Note:** If you create a public marketing site later, you'll want to allow certain pages and create a separate robots.txt for those.

### 3. Sitemap (`/app/sitemap.ts`)

Dynamic sitemap generation using Next.js 15 conventions. Includes all major routes:
- Home page (/)
- Login (/login)
- Dashboard (/dashboard)
- Products (/products)
- Sales (/sales)
- Reports (/reports)
- Analytics (/analytics)
- Staff (/staff)

**Configuration:**
- Uses `NEXT_PUBLIC_SITE_URL` environment variable
- Updates automatically with deployment
- Proper change frequencies and priorities

## Metadata Implementation

### Root Layout (`/app/layout.tsx`)

Comprehensive metadata including:

#### Basic Meta Tags
- Title with template: `%s | Stockr`
- Description optimized for search
- Keywords targeting inventory management, sales tracking, gadget business
- Author and publisher information

#### Open Graph (Facebook, LinkedIn)
- Type: website
- Locale: en_US
- Title and description optimized for social sharing
- Large image (1200×630): `/og-image.png`

#### Twitter Card
- Card type: summary_large_image
- Optimized title and description
- Twitter image: `/og-image.png`
- Creator: @stockr

#### Robots Meta
- `index: false` - Don't index pages
- `follow: false` - Don't follow links
- `nocache: true` - Don't cache pages
- Google-specific settings for snippets and previews

#### Icons Configuration
- Multiple favicon sizes (16×16, 32×32, 512×512)
- Apple touch icon (180×180)
- Mask icon for Safari
- Favicon.ico fallback

#### PWA Configuration
- Manifest linked
- Apple Web App capable
- Status bar style: default
- Application name: "Stockr"

#### Viewport Settings
- Responsive width (device-width)
- Initial scale: 1
- Maximum scale: 1 (prevents zoom on mobile inputs)
- User scalable: false
- Viewport fit: cover (for notched devices)

### Page-Specific Metadata

Each major page has custom metadata:

1. **Dashboard** (`/app/dashboard/page.tsx`)
   - Title: "Dashboard | Stockr"
   - Focus: Real-time metrics and business performance

2. **Products** (`/app/products/page.tsx`)
   - Title: "Products | Stockr"
   - Focus: Product catalog management

3. **Sales** (`/app/sales/page.tsx`)
   - Title: "Sales | Stockr"
   - Focus: Sales recording and tracking

4. **Reports** (`/app/reports/page.tsx`)
   - Title: "Reports | Stockr"
   - Focus: Sales analytics and trends

5. **Analytics** (`/app/analytics/page.tsx`)
   - Title: "Analytics | Stockr"
   - Focus: Deep analytics and insights

6. **Staff** (`/app/staff/page.tsx`)
   - Title: "Staff Management | Stockr"
   - Focus: Team and access control

7. **Settings** (`/app/settings/page.tsx`)
   - Title: "Settings | Stockr"
   - Focus: App configuration

8. **Profile** (`/app/profile/page.tsx`)
   - Title: "Profile | Stockr"
   - Focus: User account management

9. **Login** (`/app/(auth)/layout.tsx`)
   - Title: "Sign In | Stockr"
   - Focus: Authentication

## Structured Data (JSON-LD)

Located in `/app/layout.tsx`, the structured data uses Schema.org vocabulary:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Stockr",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser, iOS, Android",
  "description": "...",
  "featureList": [...]
}
```

**Benefits:**
- Helps search engines understand the application type
- Provides rich snippets in search results
- Lists key features and capabilities
- Shows aggregate ratings (if made public)

## Environment Variables

### Required for SEO

Add to `.env` (production) and `.env.local` (development):

```bash
# Production
NEXT_PUBLIC_SITE_URL=https://stockr.app

# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Purpose:** 
- Used in sitemap generation
- Used for canonical URLs
- Used in Open Graph tags
- Ensures proper absolute URLs for social sharing

### Configuration on Vercel

When deploying to Vercel, add the environment variable:
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_SITE_URL` with your production domain
3. Set for "Production" environment

## SEO Best Practices Implemented

### ✅ Technical SEO
- [x] Semantic HTML structure
- [x] Proper heading hierarchy (h1, h2, h3)
- [x] Alt text for images (where applicable)
- [x] Mobile-first responsive design
- [x] Fast load times with Next.js optimization
- [x] HTTPS ready (via Vercel)
- [x] Sitemap for crawlers
- [x] Robots.txt configuration

### ✅ On-Page SEO
- [x] Unique page titles with template
- [x] Meta descriptions for all pages
- [x] Keyword optimization
- [x] Internal linking structure
- [x] Breadcrumb navigation (via UI)

### ✅ Social Media SEO
- [x] Open Graph tags (Facebook, LinkedIn)
- [x] Twitter Card tags
- [x] High-quality social images (1200×630)
- [x] Optimized titles and descriptions for sharing

### ✅ Mobile SEO
- [x] Mobile-first design
- [x] Responsive images
- [x] Touch-friendly UI
- [x] PWA capabilities
- [x] Apple Web App configuration
- [x] Proper viewport settings

### ✅ Advanced SEO
- [x] Structured data (JSON-LD)
- [x] PWA manifest
- [x] Multiple favicon sizes
- [x] Canonical URLs (via metadataBase)
- [x] Language specification (lang="en")

## Testing Your SEO Implementation

### 1. Open Graph Testing
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/
- Paste your URL and verify the preview looks correct

### 2. Twitter Card Testing
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- Verify the card displays with correct image and text

### 3. Structured Data Testing
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- Verify the JSON-LD is valid and recognized

### 4. Mobile-Friendly Test
- **Google Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- Verify the site is mobile-optimized

### 5. PWA Testing
- **Lighthouse:** Run in Chrome DevTools (F12 → Lighthouse tab)
- Test PWA capabilities, performance, and SEO scores

### 6. Manual Checks
```bash
# Verify sitemap is accessible
curl http://localhost:3000/sitemap.xml

# Verify robots.txt is accessible
curl http://localhost:3000/robots.txt

# Verify manifest is accessible
curl http://localhost:3000/manifest.json

# Test that icons load
curl -I http://localhost:3000/icon-512.png
curl -I http://localhost:3000/og-image.png
```

## Monitoring and Maintenance

### Regular Tasks

1. **Update Images**
   - Refresh OG images when branding changes
   - Keep icon assets synchronized
   - Update screenshots in manifest

2. **Review Metadata**
   - Update descriptions as features evolve
   - Refresh keywords based on analytics
   - Add new pages to sitemap

3. **Monitor Performance**
   - Run Lighthouse audits monthly
   - Check Core Web Vitals
   - Monitor page load speeds

4. **Update Structured Data**
   - Keep feature lists current
   - Update ratings as they change
   - Add new schema types as appropriate

## Future Enhancements

Consider these additions for even better SEO:

- [ ] Blog section for content marketing (would need separate robots.txt rules)
- [ ] Public marketing pages with full indexing
- [ ] Video content for product demos
- [ ] Help center / documentation (knowledge base SEO)
- [ ] Testimonials with review schema markup
- [ ] FAQ section with FAQ schema markup
- [ ] Multi-language support (hreflang tags)
- [ ] AMP (Accelerated Mobile Pages) for marketing content
- [ ] Schema markup for business organization
- [ ] Local SEO if relevant (business location)

## Troubleshooting

### Images Not Loading

1. Check file paths in `/public` directory
2. Verify Next.js image configuration in `next.config.ts`
3. Check browser console for 404 errors
4. Ensure files are committed to git

### Metadata Not Showing

1. Clear browser cache
2. Check that `metadataBase` uses correct URL
3. Verify `NEXT_PUBLIC_SITE_URL` is set
4. Use social media debuggers to refresh cache

### PWA Not Installing

1. Verify manifest.json is accessible at `/manifest.json`
2. Check that HTTPS is enabled (required for PWA)
3. Verify icon paths in manifest
4. Check browser console for PWA errors

### Sitemap Issues

1. Visit `/sitemap.xml` directly to test
2. Verify all routes are included
3. Check that URLs are absolute (not relative)
4. Ensure `NEXT_PUBLIC_SITE_URL` is correct

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org Vocabulary](https://schema.org/)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Google Search Central](https://developers.google.com/search)

---

**Last Updated:** March 22, 2026  
**Version:** 1.0  
**Maintained by:** Stockr Team

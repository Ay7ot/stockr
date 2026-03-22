# Gadget Inventory & Sales Tracker - Project Tasks

## Phase 0: Setup & Configuration

### Infrastructure Setup
- [x] Setup Supabase project
  - [x] Create new Supabase project
  - [x] Get API credentials (URL, anon key, service role key)
  - [x] Add credentials to `.env.local`
- [x] Configure Supabase Auth
  - [x] Enable email/password authentication
  - [ ] Configure email templates (optional)
- [x] Setup Supabase Storage
  - [x] Create bucket for product images
  - [x] Set public access policies
- [x] Verify Next.js + Tailwind setup is complete
  - [x] Confirm Tailwind config
  - [x] Test dev server runs

### Database Schema
- [x] Create `products` table
  - [x] id (uuid, PK)
  - [x] name (text)
  - [x] price (numeric)
  - [x] stock_quantity (integer)
  - [x] tracking_mode (quantity | unit) — see `supabase/schema.sql` / migration
  - [x] image_url (text, nullable)
  - [x] created_at (timestamp)
- [x] Create `sales` table (transaction header: id, sold_by, created_at)
- [x] Create `sale_items` (sale_id, product_id, unit_price, quantity_sold, inventory_unit_id)
- [x] Create `inventory_units` (serialized devices: identifier, kind, status)
- [x] Create `profiles` table (extends Supabase auth.users)
  - [x] id (uuid, PK, FK → auth.users)
  - [x] name (text)
  - [x] role (text: 'admin' or 'staff')
- [x] Setup Row Level Security (RLS) policies
  - [x] Products: Admin full access, Staff read-only
  - [x] Sales / sale_items: authenticated insert & read
  - [x] inventory_units: Admin CRUD, Staff read
  - [x] Profiles: Users can read own, Admin can read all
- [x] Triggers + `record_sale` RPC — see `supabase/migrations/20250322_serialized_inventory.sql` for upgrading existing DBs

### Project Structure
- [x] Create folder structure
  - [x] `app/(auth)/` - Login page
  - [x] `app/dashboard/` - Admin dashboard
  - [x] `app/products/` - Product management
  - [x] `app/sales/` - Record sales
  - [x] `app/reports/` - Reports page
  - [x] `components/` - Reusable components
  - [x] `lib/` - Utilities, Supabase client
  - [x] `types/` - TypeScript types

---

## Phase 1: Authentication & User Management

### Auth Setup
- [x] Install Supabase client library
- [x] Create Supabase client utilities
  - [x] Browser client
  - [x] Server client (for Server Components)
- [x] Create authentication middleware
  - [x] Protect routes based on auth status
  - [x] Redirect unauthenticated users to login

### Login Page (`/login`)
- [x] Create login form UI
  - [x] Email input
  - [x] Password input
  - [x] Submit button
  - [x] Error message display
- [x] Implement login logic with Supabase Auth
- [x] Handle loading states
- [x] Style mobile-first with Tailwind

### User Context/Provider
- [x] Create user context for global auth state
- [x] Fetch user profile (name, role) on login
- [x] Handle role-based access in components

### Logout
- [x] Add logout button to navigation
- [x] Implement logout functionality

---

## Phase 2: Product Management

### Types & API
- [x] Define TypeScript types for Product
- [x] Create product API functions
  - [x] `getProducts()` - Fetch all products (`lib/products.ts`)
  - [x] `getProductById(id)` - Fetch single product (`lib/products.ts`)
  - [x] `createProduct` / `saveProduct` - Add new product (`app/actions/products.ts`)
  - [x] `updateProduct` - Edit product (`app/actions/products.ts`)
  - [x] `deleteProduct(id)` - Remove product (`app/actions/products.ts`)

### Product List Page (`/products`)
- [x] Create product list view
  - [x] Grid/list layout (mobile-first: horizontal `ProductCard` rows; desktop table)
  - [x] ProductCard component (image, name, price, stock)
- [x] Display stock quantity (no low/high stock tiers for now)
- [x] Add search/filter functionality
- [x] Loading states and empty states

### Add/Edit Product
- [x] Create product form component (`components/product-form.tsx`)
  - [x] Name input
  - [x] Tracking mode (quantity vs serialized) on create
  - [x] Price input (comma-formatted display; `en-US` grouping)
  - [x] Stock quantity input (comma-formatted display) or read-only for serialized
  - [x] Image upload (file input → Supabase Storage `images` bucket)
- [x] Admin: register inventory units (IMEI/serial) — `components/inventory-units-dialog.tsx`
- [x] Implement add product functionality (Admin only)
- [x] Implement edit product functionality (Admin only)
- [x] Image preview before upload
- [x] Form validation (client + server actions)

### Delete Product (Admin only)
- [x] Add delete button to product cards / table
- [x] Implement confirmation dialog (`components/product-delete-dialog.tsx`)
- [x] Handle delete with Supabase

### Notes (Phase 2)
- [x] RLS infinite-recursion fix for `profiles` policies — use `public.has_profile()` / `public.is_admin()` (see `supabase/schema.sql` and `supabase/fix_profiles_rls_recursion.sql` for existing projects)
- [x] Next.js `images.remotePatterns` for Supabase Storage (`next.config.ts`)

---

## Phase 3: Sales Management

### Sales Types & API
- [x] Define TypeScript types for Sale, SaleItem, InventoryUnit (`types/database.ts`)
- [x] Create sales helpers + `recordSale` server action (`lib/sales.ts`, `app/actions/sales.ts`)
  - [x] `recordSale(lines)` → Supabase RPC `record_sale` (atomic)
  - [x] `getTodayStats`, `getRecentSales`, `getReportForDay`

### Add Sale Page (`/sales`)
- [x] Create sale form (`components/sales-client.tsx`)
  - [x] Multi-line: product, editable unit price (default from catalog), quantity or serialized unit
  - [x] Serialized products: pick in-stock device by identifier
- [x] Stock validation (client + DB triggers)
- [x] Seller name from profile (`record_sale` + `profiles`)
- [x] Clear form + refresh recent list on success

### Recent Sales Display
- [x] Recent line items on sales page
- [x] Product name, quantity, line total, seller, time

---

## Phase 4: Dashboard & Reports

### Dashboard Page (`/dashboard`)
- [x] KPIs from `sale_items` for today: revenue, units, transaction count (`hooks/use-sales-stats.tsx`)
- [x] Product catalog count on dashboard (no stock alert KPIs for now)
- [ ] Quick actions section (optional polish)

### Daily Reports (`/reports`)
- [x] Date picker (`components/reports-client.tsx`)
- [x] Sales summary by product (qty, revenue from line items)
- [x] Totals for selected day

### Data Aggregation
- [x] `lib/sales.ts` — sum `unit_price * quantity_sold`, group by product for reports

---

## Phase 5: Navigation & UI Polish

### Navigation
- [x] Create NavBar component
  - [x] Role-based links (Staff sees limited menu)
  - [x] Mobile hamburger menu
  - [x] Active state styling
- [x] Create layout wrapper with navigation

### UI/UX Improvements
- [x] Add loading spinners/skeletons
- [x] Add error handling and error messages
- [x] Add empty state illustrations/messages
- [x] Add success toast notifications
- [x] Ensure mobile responsiveness throughout
- [x] Add confirmation dialogs for destructive actions

### Styling
- [x] Apply consistent color scheme
- [x] Ensure proper spacing and typography
- [x] Add hover states and transitions
- [x] Test on mobile device/emulator

---

## Phase 6: Staff Management (Optional MVP)

### Staff Page (`/staff`) - Admin only
- [x] Create staff list view
- [x] Add staff form
  - [x] Name input
  - [x] Email input
  - [x] Role selection (Admin/Staff)
  - [x] Temporary password
- [x] Implement create staff account (using Supabase Auth)
- [x] Display staff activity (sales recorded)

---

## Phase 6.5: SEO & Marketing Assets

### SEO Implementation
- [x] Create app icons and favicons
  - [x] icon-512.png (512×512) for PWA
  - [x] apple-touch-icon.png (180×180) for iOS
  - [x] favicon-16x16.png
  - [x] favicon-32x32.png
  - [x] favicon.ico (existing)
- [x] Create social media images
  - [x] og-image.png (1200×630) for Open Graph
  - [x] opengraph-image.png (Next.js convention)
  - [x] twitter-image.png for Twitter Cards
- [x] Create manifest.json for PWA
  - [x] App name and branding
  - [x] Icon references
  - [x] Theme colors
  - [x] Display mode (standalone)
- [x] Create robots.txt
  - [x] Block search engines (private business app)
- [x] Create sitemap.ts
  - [x] All major routes
  - [x] Dynamic generation
  - [x] Environment-based URLs
- [x] Add comprehensive metadata to root layout
  - [x] Title template
  - [x] Meta description and keywords
  - [x] Open Graph tags
  - [x] Twitter Card tags
  - [x] Icons configuration
  - [x] PWA settings
  - [x] Viewport configuration
- [x] Add page-specific metadata
  - [x] Dashboard
  - [x] Products
  - [x] Sales
  - [x] Reports
  - [x] Analytics
  - [x] Staff
  - [x] Settings
  - [x] Profile
  - [x] Login
- [x] Add JSON-LD structured data
  - [x] SoftwareApplication schema
  - [x] Feature list
  - [x] Ratings (placeholder)
- [x] Configure environment variables
  - [x] NEXT_PUBLIC_SITE_URL for production
  - [x] .env.example template
- [x] Create SEO documentation
  - [x] Complete implementation guide
  - [x] Testing instructions
  - [x] Troubleshooting tips

---

## Phase 7: Testing & Deployment

### Testing
- [ ] Test authentication flows
  - [ ] Login as Admin
  - [ ] Login as Staff
  - [ ] Access control (Staff can't access Admin features)
- [ ] Test product management
  - [ ] CRUD operations
  - [ ] Image upload
- [ ] Test sales recording
  - [ ] Stock decreases correctly
  - [ ] Validation works
- [ ] Test dashboard data
  - [ ] Sales totals correct
  - [ ] Low stock alerts appear
- [ ] Mobile testing
  - [ ] Test on actual mobile device
  - [ ] Check touch targets and readability

### Data Setup
- [ ] Upload initial product list (manual)
- [ ] Create admin account for owner
- [ ] Create staff accounts if needed
- [ ] Verify sample data displays correctly

### Deployment
- [ ] Setup Vercel project
- [ ] Configure environment variables on Vercel
  - [ ] Supabase URL
  - [ ] Supabase anon key
- [ ] Deploy to production
- [ ] Verify deployment works
  - [ ] Test login
  - [ ] Test all features
  - [ ] Check for console errors

### Documentation
- [ ] Create README.md with setup instructions
- [ ] Document user roles and permissions
- [ ] Document how to add initial products

---

## Phase 8: Post-MVP Enhancements (Future)

- [ ] Bulk product upload (CSV/Excel)
- [ ] Advanced reporting (date ranges, charts)
- [ ] Export to CSV/PDF
- [ ] Email notifications for low stock
- [ ] Barcode scanning for products
- [ ] Multi-location inventory support
- [ ] Customer management
- [ ] Receipt generation

---

## Current Status

**Phase:** 6.5 (SEO & Marketing Assets) — **complete**
**Next up:** Phase 7 — Testing & Deployment

**Recently Completed:**
- ✅ Phase 6: Staff Management
- ✅ Phase 6.5: SEO & Marketing Assets (icons, metadata, structured data)

**Completed (through Phase 4):**
- [x] Serialized inventory: `inventory_units`, `tracking_mode`, triggers, `record_sale` RPC (`supabase/schema.sql`, `supabase/migrations/20250322_serialized_inventory.sql`)
- [x] Types: `Product`, `Sale`, `SaleItem`, `InventoryUnit` (`types/database.ts`)
- [x] Products: tracking mode, stock rules, **Units** dialog for admins (`inventory-units-dialog.tsx`)
- [x] Sales: multi-line form, variable pricing, serialized lines (`sales-client.tsx`, `app/actions/sales.ts`)
- [x] Dashboard: today revenue / units / transactions from `sale_items` (`use-sales-stats.tsx`)
- [x] Reports: date picker + per-product revenue (`reports-client.tsx`, `use-report-for-day.tsx`)

**Next Steps:**
- **Existing Supabase project:** run `supabase/migrations/20250322_serialized_inventory.sql` in the SQL Editor (backfills `sale_items`, slims `sales`, adds new tables). **New project:** run full `supabase/schema.sql` or the migration after base tables exist.
- Ensure first admin user exists in Supabase Auth + `profiles.role = admin`
- Optional: Phase 5–7 items (nav polish, staff management, deployment checklist)

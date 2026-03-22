Product Requirements Document (PRD)

Product Name: Gadget Inventory & Sales Tracker MVP

Objective:
Provide small gadget/tech businesses a simple, intuitive system to track inventory, record sales, and view daily reports, reducing staff confusion and giving owners clear visibility into stock and revenue.

Target Users:

Admin (Owner/Manager): Full access, sees dashboard, manages products, staff, and reports

Staff: Limited access, can record sales and view stock

Platform / Stack:

Frontend: Next.js + TailwindCSS (mobile-first)

Backend: Supabase (PostgreSQL + Auth + Storage for images)

Hosting: Vercel

Authentication: Supabase Auth (email/password)

Functional Requirements
1️⃣ User Authentication
Feature	Description	Role
Sign Up / Login	Users log in with email/password	Admin/Staff
Role-based Access	Admin vs Staff determines access	Admin/Staff
Session Management	Keep users logged in across sessions	All
2️⃣ Product Management
Feature	Description
Add Product	Admin can add new product: name, default price, stock tracking mode (quantity vs serialized), stock quantity or per-device units, image
Edit Product	Admin can edit product details
Delete Product	Admin can remove products
View Products	Staff/Admin can see product list with stock + price + image
3️⃣ Inventory Management
Feature	Description
Track Stock	Stock decreases automatically when sale is recorded
Low Stock Alert	Deferred (no low/high stock tiers in current UI)
Initial Upload	Admin sends product list → you upload it (manual for MVP)
4️⃣ Sales Management
Feature	Description
Add Sale	Staff/Admin records line items: per-line sale price (can differ from catalog), quantity-tracked or serialized unit (IMEI/serial); stock updates in DB transaction
Record Seller	Track which staff member recorded the sale
Timestamp	Auto-record date/time of sale
5️⃣ Dashboard / Reporting
Feature	Description
Daily Sales	Total quantity sold per product, total revenue (from actual line prices)
Stock Overview	Current stock per product, low stock highlights
Export Data	Optional CSV export (for future upgrades)
6️⃣ Staff Management (Optional MVP)
Feature	Description
Add Staff	Admin can create staff accounts
Role Assignment	Assign role (Staff/Admin)
Staff Overview	See which staff recorded sales
Database Schema (Supabase)

products

Column	Type	Notes
id	uuid (PK)	Auto-generated
name	text	Product name
price	numeric	Default/suggested price (UI prefill)
tracking_mode	text	quantity (bulk count) or unit (serialized devices)
stock_quantity	integer	Remaining stock (for quantity mode; for unit mode, kept in sync with in-stock rows)
image_url	text	Optional public image URL

inventory_units

Column	Type	Notes
id	uuid (PK)	Auto-generated
product_id	uuid	FK → products.id
identifier	text	Unique normalized IMEI/serial/etc.
identifier_kind	text	imei | serial | other
status	text	in_stock | sold
sold_at	timestamp	When sold (if sold)

sales

Column	Type	Notes
id	uuid (PK)	Auto-generated
sold_by	text	Staff/Admin name
created_at	timestamp	Defaults to now()

sale_items

Column	Type	Notes
id	uuid (PK)	Auto-generated
sale_id	uuid	FK → sales.id
product_id	uuid	FK → products.id
unit_price	numeric	Actual price for this line (authoritative for revenue)
quantity_sold	integer	Quantity (1 for serialized lines)
inventory_unit_id	uuid	Optional FK → inventory_units (required when product is unit-tracked)

users

Column	Type	Notes
id	uuid (PK)	Auto-generated
name	text	Staff/Admin name
role	text	‘admin’ or ‘staff’
email	text	For login
UI / Pages

/login → Email/password login

/dashboard → Admin dashboard (daily sales, low stock, revenue)

/products → Add/Edit/Delete/View products

/sales → Record sale (multi-line, variable prices, serialized units when applicable)

/reports/daily → Summary of sales and stock

/staff → Manage staff (optional)

Components:

ProductCard → image + name + price + stock

Sale form → line items: product, unit price, quantity or device unit; RPC record_sale for atomic stock updates

DashboardStats → daily sales, revenue, low stock count

NavBar → role-based navigation

MVP Constraints

No bulk upload → manually upload initial stock

No advanced reporting → daily summaries only

Mobile-first, responsive design

Focus on fast build + deploy in 8–12 hours

Non-Functional Requirements

Fast load times (<2 sec)

Secure authentication via Supabase

Intuitive interface → staff can use without training

Scalable for future features

Tech Implementation Notes

Frontend → Next.js pages + React components

Backend → Supabase CRUD queries

Dashboard → aggregate sales using Supabase queries

Stock updates → transactional update when sale inserted

Images → stored in Supabase Storage → public URLs → displayed in UI

Delivery Plan for Today

Setup Supabase tables + Auth → 1 hour

Setup Next.js project + Tailwind → 1 hour

Build Products page → 2 hours

Build Add Sale page → auto-update stock → 2 hours

Build Dashboard → 2 hours

Deploy → 1 hour

Upload initial stock (manual) → 1 hour

Total: ~10 hours → feasible for same-day delivery
# Handoff: ShopHub Multi-Vendor Marketplace UI

## Overview
Full UI design for "ShopHub" — a multi-vendor e-commerce marketplace with three surfaces: Buyer-facing storefront (mobile-first + desktop web), Seller Center dashboard, and Admin Panel. 22 screens total plus a Design System reference.

## About the Design Files
The `.dc.html` files in this bundle are **design references built in HTML** — high-fidelity prototypes showing intended look, layout, and interaction, **not production code to copy directly**. The task is to **recreate these designs in the target codebase**:
- Buyer-facing screens → **Next.js** (React), mobile-first responsive, Tailwind CSS or CSS Modules per the target repo's convention.
- Seller Center + Admin Panel → **React + Vite**, desktop-first.

If no frontend scaffold exists yet, set up Next.js for buyer and a separate React+Vite app for seller/admin as described, using the design tokens below.

Each buyer-facing screen includes BOTH a mobile mockup (in a phone frame) and a desktop/website mockup (in a browser frame), toggled via a "📱 Mobile / 💻 Website" switcher in the HTML — build both breakpoints from these two views.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy (in Vietnamese), and component states shown are final — recreate pixel-close using the codebase's component library (or build new components matching these specs exactly).

## Design Tokens

### Colors
- Primary "Hub Blue": 50 `#EEF1FF` · 100 `#DCE3FF` · 200 `#B9C7FF` · 300 `#8FA3FF` · 400 `#5C79F5` · 500 (base) `#3A56E8` · 600 `#2A3FD1` · 700 `#1F30A8` · 800 `#172480` · 900 `#101A5C`
- Accent "Signal Amber" (CTA only — Buy Now / flash sale): 50 `#FFF4E5` · 100 `#FFE2B8` · 300 `#FFB25C` · 500 (base) `#FF8A1E` · 700 `#B85600`
- Neutrals: 0 `#FFFFFF` · 50 `#F7F8FC` · 100 `#EEF0F7` · 200 `#DDE1EC` · 300 `#C3C9DB` · 400 `#9AA1B9` · 500 `#6E7591` · 600 `#545A75` · 700 `#3B4059` · 900 (ink) `#14162A`
- Semantic: Success `#1A9E5C` (tint `#E6F7EE`) · Warning `#D97706` (tint `#FFF4E0`) · Error `#D6293E` (tint `#FDEAEC`) · Info `#2563C7` (tint `#EAF1FD`)
- Admin sidebar uses a darker ink `#0B0F24`; Seller sidebar uses `#101A5C`.

### Typography
- Display font: **Sora** (weights 600/700/800) — all headings, prices, brand wordmark.
- Body font: **Manrope** (weights 400–800) — body copy, labels, buttons.
- Scale: Display 48/56 · H1 36/44 · H2 28/36 · H3 22/30 · H4 18/26 · Body L 16/24 · Body M 14/22 · Caption 12/16.

### Spacing & Radius
- Spacing scale (4px base): 4, 8, 12, 16, 24, 32, 48, 64, 96px.
- Radius: 8px (inputs/badges), 10px (buttons/small cards), 16px (cards/modals).
- Standard shadow: `0 4px 16px rgba(16,26,92,0.08)`.
- Container: 1200px max-width, 12-col grid, 24px gutter (desktop) / 16px (mobile).

### Breakpoints
- Mobile ≤599px · Tablet 600–1023px · Desktop 1024–1439px · Wide ≥1440px.

## Screens

### Design System (`Design System.dc.html`)
Full palette, type scale, spacing/grid, and core components: buttons (primary/CTA-amber/outline/ghost/danger/disabled, 3 sizes), inputs (default/error/success/disabled), badges, cards, tabs, table, pagination, breadcrumbs, modal, toast. Use this as the single source of truth for a shared component library.

### Buyer-facing (11 screens — Next.js)
1. **Homepage** (`Homepage.dc.html`) — sticky header (location + search + notifications), hero promo banner w/ carousel dots, 8-item category grid, dark Flash Sale rail with countdown + sold-progress bars, 2-col (mobile) / 6-col (desktop) "Recommended" product grid, bottom tab bar (mobile). Desktop adds a top utility bar, full nav row, and 2-column hero layout.
2. **Category/Listing** (`Category Listing.dc.html`) — breadcrumb, horizontal filter chips (Price/Brand/Rating/Shipping), sort + grid/list view toggle, product grid/list, pagination. Built-in state switcher demonstrates **data / empty / loading (skeleton)** states — implement all three. Desktop adds a left filter sidebar.
3. **Product Detail** (`Product Detail.dc.html`) — image gallery w/ dot indicator, discount badge, title/rating/price, color + size selectors (stateful), shipping info row, seller mini-card, description, rating breakdown bars + reviews, Q&A, sticky Add-to-cart/Buy-now bar. Desktop: 2-col gallery+info, then description/Q&A + reviews side by side.
4. **Search Results** (`Search Results.dc.html`) — search bar; 3 states via switcher: **suggest** (recent searches, trending list, top categories), **results** (product grid), **empty** (no-results + suggestions).
5. **Cart** (`Cart.dc.html`) — shop-grouped line items w/ checkboxes, qty stepper, voucher entry, recommendations rail, sticky summary bar. 3 states: **full / issue (an out-of-stock item auto-deselected + warning banner) / empty**.
6. **Checkout** (`Checkout.dc.html`) — 4-step flow (Address → Shipping → Payment → Confirmation) with a progress stepper, Back/Continue navigation, order summary sidebar (desktop) or inline (mobile), success screen with order number.
7. **Order Tracking / History** (`Order Tracking.dc.html`) — status-filter tabs, order list cards with contextual action button (Track/Review/Buy again), tap-through to a detail view with a vertical shipping timeline + delivery address + items.
8. **Profile & Account Settings** (`Profile Settings.dc.html`) — profile header, stat row (orders/wishlist/vouchers/points), grouped settings menu, Edit-info form (name/email/phone/DOB/gender).
9. **Wishlist** (`Wishlist.dc.html`) — saved-items grid with out-of-stock overlay; 2 states: **has items / empty**.
10. **Login / Register / Forgot Password** (`Auth.dc.html`) — single file with an in-design switcher between the 3 views; social login buttons; desktop adds a branded split-screen layout.
11. **Seller Storefront (public)** (`Seller Storefront.dc.html`) — shop cover + avatar, Follow/Chat actions, stat row, voucher strip, tabs (Products/Reviews/About).

### Seller Center (5 screens — React + Vite, desktop-first, 1440px canvas)
12. **Seller Dashboard** (`Seller Dashboard.dc.html`) — KPI cards (revenue/orders/listings/cancel-rate), 7-day revenue bar chart, order-status breakdown bars, recent-orders table, top-products list.
13. **Product Management** (`Product Management.dc.html`) — product table (search/category/status filters, bulk checkbox, status badge, edit/delete) + a Create/Edit form (basic info, images, variant table, status radio, shipping dimensions).
14. **Order Management** (`Order Management.dc.html`) — status-tab table of orders → detail view (items, totals, shipping address, status-update radio list, confirm/print actions).
15. **Inventory Management** (`Inventory Management.dc.html`) — stock KPIs, low-stock alert banner, filter tabs, per-SKU table with stock/reserved/available + status bar.
16. **Shop Settings** (`Shop Settings.dc.html`) — left sub-nav (Shop info / Contact & address / Shipping / Payment / Notifications) driving a right-hand settings panel per section.

### Admin Panel (5 screens — React + Vite, desktop-first, 1440px canvas)
17. **Admin Dashboard** (`Admin Dashboard.dc.html`) — platform KPIs (GMV/users/active shops/orders), GMV trend chart, "Needs action" queue (pending shops/products/reports/complaints), new-shops table, top-categories bars.
18. **User Management** (`User Management.dc.html`) — role KPIs, role-filter tabs, user table with lock/unlock/approve actions.
19. **Shop/Seller Approval** (`Shop Approval.dc.html`) — status-tab table of applicant shops → detail view with submitted documents, a review checklist, and Approve/Reject actions (reject requires a note).
20. **Product Moderation** (`Product Moderation.dc.html`) — flagged-products table (flag reason column) → detail view with the flag reason, description, moderation history, and Approve / Request-changes / Remove actions.
21. **Category Management** (`Category Management.dc.html`) — indented category table (parent/child) with product count, commission %, active toggle, edit/delete; slide-in "new category" form (name, parent, icon, commission).
22. **Reports & Analytics** (`Reports Analytics.dc.html`) — 3 report tabs (Revenue / Users / Order Ops), each with its own KPI row + chart: revenue → weekly bars + category breakdown + top-sellers table; users → weekly new-user bars; orders → carrier performance table.

## Interactions & Behavior
- All list/detail screens (Order Management, Shop Approval, Product Moderation) use a **list ⇄ detail** pattern: clicking a row swaps the content pane; a "← Back to list" link returns.
- Screens with explicit empty/loading/error states (Category Listing, Cart, Search, Wishlist) use a small pill switcher in the mockup purely for demo purposes — in the real app these states are driven by actual data/query status, not a manual toggle.
- Checkout: `Continue` advances the step; `Back` retreats; the final step becomes an order-confirmation screen with a different action bar (Home / View order).
- Product Detail: color/size selection updates the highlighted swatch/chip border+background; wishlist heart toggles fill color.
- All charts are plain flex/CSS bars driven by an array of `{label, value}` — replace with a real charting library (e.g., Recharts) 1:1 against the same data shape.

## Assets
No external image assets — all product/category imagery is represented with emoji placeholders on tinted backgrounds. Replace with real product photography / category icons at implementation time, keeping the same tinted-background card treatment.

## Files
All files are in this folder, flat:
- `Design System.dc.html`
- `Homepage.dc.html`, `Category Listing.dc.html`, `Product Detail.dc.html`, `Search Results.dc.html`, `Cart.dc.html`, `Checkout.dc.html`, `Order Tracking.dc.html`, `Profile Settings.dc.html`, `Wishlist.dc.html`, `Auth.dc.html`, `Seller Storefront.dc.html`
- `Seller Dashboard.dc.html`, `Product Management.dc.html`, `Order Management.dc.html`, `Inventory Management.dc.html`, `Shop Settings.dc.html`
- `Admin Dashboard.dc.html`, `User Management.dc.html`, `Shop Approval.dc.html`, `Product Moderation.dc.html`, `Category Management.dc.html`, `Reports Analytics.dc.html`

Open any file directly in a browser to view/interact with the design (click state switchers, tabs, steppers, etc. to see all states).

# ShopHub — React + TypeScript eCommerce Frontend

A complete, production-ready eCommerce frontend built with React 18, TypeScript, Tailwind CSS, and React Router v6. Connects to your existing backend at `http://localhost:8000`.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional — defaults to http://localhost:8000)
cp .env.example .env

# 3. Start development server
npm run dev
# App opens at http://localhost:3000
```

## Build for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

---

## Project Structure

```
src/
├── api/
│   └── index.ts            # All API fetch functions (typed)
├── contexts/
│   ├── AuthContext.tsx      # Auth state + login/logout/register
│   ├── CartContext.tsx      # Cart state + add/update/remove
│   └── ToastContext.tsx     # Global toast notifications
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx      # Spinner + skeleton screens
│   │   ├── Pagination.tsx
│   │   ├── StarRating.tsx
│   │   ├── Badge.tsx        # OrderStatusBadge
│   │   ├── Toast.tsx        # Toast notification container
│   │   └── ProtectedRoute.tsx
│   ├── layout/
│   │   ├── Header.tsx       # Sticky nav with cart badge + user dropdown
│   │   ├── Footer.tsx
│   │   └── Layout.tsx       # Outlet wrapper
│   └── product/
│       └── ProductCard.tsx  # Card with add-to-cart + wishlist
├── pages/
│   ├── Home.tsx             # Product grid with search/filter/sort/pagination
│   ├── ProductDetail.tsx    # Images, reviews, add-to-cart
│   ├── Cart.tsx             # Line items + order summary
│   ├── Checkout.tsx         # 2-step shipping + payment
│   ├── Orders.tsx           # Order history with expandable details
│   ├── Wishlist.tsx
│   ├── Profile.tsx          # Edit profile + change password
│   ├── Login.tsx
│   ├── Register.tsx
│   └── admin/
│       ├── Dashboard.tsx    # Stats + all orders + status management
│       └── Products.tsx     # Full CRUD product management
├── types/
│   └── index.ts             # All shared TypeScript types
├── App.tsx                  # Router + providers
├── main.tsx
└── index.css
```

## Features

- **Authentication** — Cookie-based session restored on page load, protected routes, admin-only routes
- **Product browsing** — Search, filter by category + price range, sort, pagination
- **Product detail** — Image gallery, stock status, quantity selector, reviews with star ratings
- **Shopping cart** — Real-time quantity updates, running total, shipping threshold
- **Checkout** — 2-step form (shipping address → payment method), form validation
- **Order history** — Expandable order cards with full item and address details
- **Wishlist** — Add/remove, inline add-to-cart
- **Profile** — Edit name/phone/address, change password with strength meter
- **Admin dashboard** — Revenue stats, monthly bar chart, all-orders table with inline status updates
- **Admin products** — Full create / edit / delete with modal form and confirmation dialog
- **Toast notifications** — Global success/error/info system
- **Responsive** — Mobile menu, stacked layouts, touch-friendly

## Backend Requirements

Your API must support:

- `credentials: 'include'` (CORS with `credentials: true` and `Access-Control-Allow-Origin` set to `http://localhost:3000`)
- `sessionId` httpOnly cookie for authentication
- All endpoints documented in the project brief

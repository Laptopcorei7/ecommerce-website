# 🛒 ShopAPI — Full-Stack E-Commerce Platform

A full-stack e-commerce web application built with a **React (Vite + TypeScript)** frontend and a **Node.js / Express** backend backed by **MongoDB**. Supports product browsing, cart management, wishlists, order processing, reviews, and a full admin dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | Session-based auth with role-based access control |
| State | React Context API (Auth, Cart, Wishlist, Toast) |

---

## Features

### Customer
- Browse and filter products by category, price range, and search term
- View detailed product pages with reviews and ratings
- Add products to cart or wishlist
- Move wishlist items directly to cart
- Checkout and place orders
- View and cancel orders
- Manage profile and change password
- Leave reviews on products

### Admin
- Separate admin login with employee ID verification
- Dashboard with overview stats (orders, revenue, users, products)
- Order management — view all orders and update statuses
- Product management — create, update, and delete products
- Sales analytics and revenue by month
- User statistics and top customer reports
- Inventory alerts for low/out-of-stock products

---

## Project Structure

```
├── client/                   # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/            # Route-level pages (Home, Cart, Orders, Admin, etc.)
│   │   ├── components/       # Shared UI components
│   │   ├── contexts/         # React Context providers (Auth, Cart, Wishlist, Toast)
│   │   ├── api/              # Typed API client (index.ts)
│   │   └── types/            # TypeScript type definitions
│   └── index.html
│
└── server/                   # Express backend
    ├── controllers/          # Route handler functions
    ├── models/               # Mongoose models
    ├── routes/               # Express routers
    ├── middleware/            # Auth & admin middleware
    └── utils/                # Utility functions (currency formatting, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/shopdb
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:8000`.

---

## API Reference

All endpoints are prefixed with `http://localhost:8000`. Authentication uses session cookies — login first, then all subsequent requests are authenticated automatically.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Register a new user |
| POST | `/login` | — | User login |
| POST | `/admin/login` | — | Admin login (requires `employeeId`) |
| POST | `/logout` | ✓ | Log out |
| GET | `/me` | ✓ | Get current user |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | — | List all products (supports filters) |
| GET | `/products/:id` | — | Get single product |
| POST | `/products` | Admin | Create product |
| PUT | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |

**Query Parameters for `GET /products`:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Name search (case-insensitive) |
| `category` | string | One of: `Electronics`, `Clothing`, `Books`, `Home`, `Sports`, `Other` |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `sort` | string | One of: `price`, `-price`, `-name`, `createdAt`, `-createdAt`, `-averageRating` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page, max 100 (default: 10) |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | ✓ | Get user's cart |
| POST | `/cart` | ✓ | Add item to cart |
| PUT | `/cart/:id` | ✓ | Update cart item quantity |
| DELETE | `/cart/:id` | ✓ | Remove specific cart item |
| DELETE | `/cart` | ✓ | Clear entire cart |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | ✓ | Create order from cart |
| GET | `/orders` | ✓ | Get current user's orders |
| GET | `/order/:id` | ✓ | Get a specific order |
| PUT | `/orders/:id/cancel` | ✓ | Cancel an order |
| GET | `/order/all/admin` | Admin | Get all orders |
| PUT | `/orders/:id/status` | Admin | Update order status |

**Order statuses:** `pending` → `paid` → `processing` → `shipped` → `delivered` / `cancelled`

> Orders can only be cancelled by the user while in `pending` or `paid` status. Cancelling an order automatically restores product stock.

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | ✓ | Get wishlist |
| POST | `/wishlist` | ✓ | Add product to wishlist |
| DELETE | `/wishlist/:productId` | ✓ | Remove from wishlist |
| DELETE | `/wishlist` | ✓ | Clear wishlist |
| POST | `/wishlist/:productId/cart` | ✓ | Move item to cart |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products/:productId/reviews` | — | Get reviews for a product |
| GET | `/reviews/:reviewId` | — | Get a single review |
| POST | `/products/:productId/reviews` | ✓ | Submit a review |
| PUT | `/reviews/:reviewId` | ✓ | Update a review |
| DELETE | `/reviews/:reviewId` | ✓ | Delete a review |
| GET | `/users/me/reviews` | ✓ | Get current user's reviews |

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| PUT | `/profile` | ✓ | Update name |
| PUT | `/profile/password` | ✓ | Change password |

### Admin Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard/overview` | Admin | Summary stats |
| GET | `/admin/dashboard/orders` | Admin | Order stats by status |
| GET | `/admin/dashboard/products` | Admin | Inventory and category stats |
| GET | `/admin/dashboard/sales` | Admin | Top products and monthly revenue |
| GET | `/admin/dashboard/users` | Admin | User stats and top customers |
| GET | `/admin/dashboard/recent` | Admin | Recent orders, reviews, signups |

---

## Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home / product listing |
| `/products/:id` | Public | Product detail page |
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/admin/login` | Public | Admin login |
| `/cart` | Auth required | Shopping cart |
| `/checkout` | Auth required | Checkout flow |
| `/orders` | Auth required | Order history |
| `/wishlist` | Auth required | Wishlist |
| `/profile` | Auth required | User profile |
| `/admin` | Admin required | Admin dashboard |
| `/admin/products` | Admin required | Product management |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Port for the Express server (default: 8000) |
| `MONGO_URI` | MongoDB connection string |
| `SESSION_SECRET` | Secret key for session signing |
| `NODE_ENV` | `development` or `production` |

> See `.env.example` for a template.

---

## License

MIT

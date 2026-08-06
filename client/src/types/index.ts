// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: "Electronics" | "Clothing" | "Books" | "Home" | "Sports" | "Other";
  stock: number;
  brand?: string;
  images: string[];
  averageRating: number;
  totalReviews: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?:
    | "price"
    | "-price"
    | "-name"
    | "createdAt"
    | "-createdAt"
    | "-averageRating";
  page?: number;
  limit?: number;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId?: string;
  user: { name: string; avatar?: string };
  productId?: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase?: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * GET /products/:id/reviews returns this envelope, not a bare array. The
 * client previously typed it as `Review[]`, so every product page silently
 * rendered zero reviews.
 */
export interface ProductReviewsResponse {
  productId: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    reviewsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateReviewPayload {
  rating: number;
  /** Required by the API. A review without one is rejected with a 400. */
  title: string;
  comment: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    category: string;
    image: string | null;
    currentPrice: number;
    stock: number;
  };
  addedAt: string;
}

export interface Cart {
  cart: CartItem[];
  summary: {
    totalItems: number;
    totalPrice: number;
  };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: OrderStatus;
  itemCount: number;
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: Address;
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  shipping?: number;
}

export interface CreateOrderPayload {
  shippingAddress: Address;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    stock: number;
    images: string[];
    brand?: string;
    averageRating: number;
  };
  addedAt: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface DashboardStats {
  overview: {
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalReviews: number;
    pendingOrders: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  today: {
    orders: number;
    newUsers: number;
    newReviews: number;
  };
  thisMonth: {
    orders: number;
    orderGrowth: string;
  };
  revenue: {
    total: string;
    averageOrderValue: string;
  };
}

// ─── API Helpers ─────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

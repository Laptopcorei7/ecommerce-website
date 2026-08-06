import type {
  User,
  Product,
  ProductsResponse,
  ProductFilters,
  Review,
  ProductReviewsResponse,
  CreateReviewPayload,
  Cart,
  CartItem,
  Order,
  OrderStatus,
  CreateOrderPayload,
  WishlistItem,
  DashboardStats,
} from "@/types";

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000";

// ─── Core Fetch ──────────────────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errData = await response.json();
        errorMessage = errData.message || errData.error || errorMessage;
      } catch {
        // use default message
      }
      const error = new Error(errorMessage) as Error & { status: number };
      error.status = response.status;
      console.error(
        `API Error [${response.status}] ${endpoint}:`,
        errorMessage,
      );
      throw error;
    }

    const text = await response.text();
    if (!text) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      const error = new Error(
        `Malformed JSON response from ${endpoint}`,
      ) as Error & { status: number };
      error.status = response.status;
      console.error(
        `API Error [${response.status}] ${endpoint}: response body was not JSON`,
      );
      throw error;
    }
  }

  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
  ) {
    let url = endpoint;
    if (params) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          qs.append(k, String(v));
        }
      });
      const qstr = qs.toString();
      if (qstr) url += "?" + qstr;
    }
    return this.request<T>(url, { method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

const api = new ApiClient(BASE_URL);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ user: User; message: string }>("/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; message: string }>("/login", data),

  // Separate admin login. Requires employeeId in addition to email + password
  adminLogin: (data: { employeeId: string; email: string; password: string }) =>
    api.post<{ user: User; message: string }>("/admin/login", data),

  logout: () => api.post<{ message: string }>("/logout"),

  getMe: () => api.get<{ user: User }>("/me"),
};

// ─── Products ────────────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (filters?: ProductFilters) =>
    api.get<ProductsResponse>(
      "/products",
      filters as Record<string, string | number | boolean | undefined>,
    ),

  getById: (id: string) => api.get<{ product: Product }>(`/products/${id}`),

  create: (data: Partial<Product>) => api.post<Product>("/products", data),

  update: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/products/${id}`),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviewsApi = {
  getByProduct: (
    productId: string,
    params?: { page?: number; limit?: number; sort?: string },
  ) =>
    api.get<ProductReviewsResponse>(`/products/${productId}/reviews`, params),

  create: (productId: string, data: CreateReviewPayload) =>
    api.post<{ message: string; review: Review }>(
      `/products/${productId}/reviews`,
      data,
    ),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () => api.get<Cart>("/cart"),

  addItem: (data: { productId: string; quantity: number }) =>
    api.post<{ message: string; cartItem: CartItem }>(`/cart`, data),

  updateItem: (id: string, data: { quantity: number }) =>
    api.put<{ message: string; cartItem: CartItem }>(`/cart/${id}`, data),

  removeItem: (id: string) => api.delete<{ message: string }>(`/cart/${id}`),

  clear: () => api.delete<{ message: string; itemsRemoved: number }>("/cart"),
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const ordersApi = {
  create: (data: CreateOrderPayload) =>
    api.post<{ message: string; order: Order }>("/orders", data),

  getUserOrders: () => api.get<{ count: number; orders: Order[] }>("/orders"),

  getById: (id: string) => api.get<{ order: Order }>(`/order/${id}`),

  getAllOrders: () =>
    api.get<{ count: number; orders: Order[] }>("/order/all/admin"),

  updateStatus: (id: string, status: OrderStatus) =>
    api.put<{ message: string; order: Order }>(`/orders/${id}/status`, {
      status,
    }),

  cancel: (id: string) =>
    api.put<{ message: string; order: Order }>(`/orders/${id}/cancel`),
};

// ─── Wishlist ────────────────────────────────────────────────────────────────

export const wishlistApi = {
  get: () => api.get<{ count: number; items: WishlistItem[] }>("/wishlist"),

  add: (productId: string) =>
    api.post<{ message: string; item: WishlistItem }>("/wishlist", {
      productId,
    }),

  remove: (productId: string) =>
    api.delete<{ message: string }>(`/wishlist/${productId}`),

  clear: () =>
    api.delete<{ message: string; deletedCount: number }>("/wishlist"),

  moveToCart: (productId: string, quantity = 1) =>
    api.post<{ message: string }>(`/wishlist/${productId}/cart`, { quantity }),
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profileApi = {
  update: (data: { name: string }) =>
    api.put<{ message: string; user: User }>("/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>("/profile/password", data),
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => api.get<DashboardStats>("/admin/dashboard/overview"),
  getOrderStats: () => api.get("/admin/dashboard/orders"),
  getProductStats: () => api.get("/admin/dashboard/products"),
  getSales: () => api.get("/admin/dashboard/sales"),
  getUserStats: () => api.get("/admin/dashboard/users"),
  getActivity: () => api.get("/admin/dashboard/recent"),
};

export default api;

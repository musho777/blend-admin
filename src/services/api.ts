const API_BASE_URL = 'https://blend-backend-production-0649.up.railway.app';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
  role: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  subcategoryId?: string | null;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isBestSelect?: boolean;
  disabled?: boolean;
  priority?: number;
  imageUrls?: string[];
}

export interface Category {
  id: string;
  title: string;
  slug?: string;
  image: string;
  orderIndex?: number;
}

export interface Subcategory {
  id: string;
  title: string;
  categoryId: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  image: string;
  url: string;
  text?: string;
  priority?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    productTitle: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalPrice: number;
  name: string;
  status: 'pending' | 'rejected' | 'success';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    pending?: number;
    processing?: number;
    shipped?: number;
    delivered?: number;
    cancelled?: number;
    rejected?: number;
    success?: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  googleId: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('API Service: Attempting login to /admin/login');
    const response = await this.request<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('API Service: Login response received:', response);
    this.setToken(response.accessToken);
    console.log('API Service: Token set:', response.accessToken);
    return response;
  }

  async verifyToken(): Promise<{ email: string; role: string }> {
    // Since there's no verify endpoint, we'll try to access a protected endpoint
    // to validate the token. We can use the categories endpoint for this.
    try {
      await this.request('/categories');
      // If the request succeeds, the token is valid
      // We'll return mock data since we don't have user details from the token alone
      const token = this.token;
      if (token) {
        // For now, return the stored admin info
        return { email: 'admin@example.com', role: 'admin' };
      }
      throw new Error('No token available');
    } catch (error) {
      throw new Error('Token verification failed');
    }
  }

  logout() {
    this.clearToken();
  }

  // Products
  async getProducts(params?: { page?: number; limit?: number; search?: string }): Promise<{
    data: Product[];
    meta: {
      hasNext: boolean;
      hasPrevious: boolean;
      limit: number;
      page: number;
      pages: number;
      total: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString();
    const endpoint = `/products${query ? `?${query}` : ''}`;

    return this.request(endpoint);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async createProductWithImages(formData: FormData): Promise<Product> {
    const url = `${API_BASE_URL}/products`;

    const headers: HeadersInit = {};

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async updateProductWithImages(id: string, formData: FormData): Promise<Product> {
    const url = `${API_BASE_URL}/products/${id}`;

    const headers: HeadersInit = {};

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Omit<Category, 'id'>>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async createCategoryWithImage(formData: FormData): Promise<Category> {
    const url = `${API_BASE_URL}/categories`;

    const headers: HeadersInit = {};

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async updateCategoryWithImage(id: string, formData: FormData): Promise<Category> {
    const url = `${API_BASE_URL}/categories/${id}`;

    const headers: HeadersInit = {};

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Subcategories
  async getSubcategories(): Promise<Subcategory[]> {
    return this.request<Subcategory[]>('/subcategories');
  }

  async getSubcategory(id: string): Promise<Subcategory> {
    return this.request<Subcategory>(`/subcategories/${id}`);
  }

  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    return this.request<Subcategory[]>(`/categories/${categoryId}/subcategories`);
  }

  async createSubcategory(data: { title: string; categoryId: string; orderIndex?: number }): Promise<Subcategory> {
    return this.request<Subcategory>('/subcategories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubcategory(
    id: string,
    data: { title?: string; categoryId?: string; orderIndex?: number }
  ): Promise<Subcategory> {
    return this.request<Subcategory>(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubcategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/subcategories/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders
  async getOrders(params?: { status?: string; page?: number; limit?: number }): Promise<{
    orders: Order[];
    meta: {
      hasNext: boolean;
      hasPrevious: boolean;
      limit: number;
      page: number;
      pages: number;
      total: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString();
    const endpoint = `/orders${query ? `?${query}` : ''}`;

    return this.request(endpoint);
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteOrder(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/orders/statistics/dashboard');
  }

  // Public endpoints (for frontend)
  async getPublicCategories(): Promise<Category[]> {
    return this.request<Category[]>('/home/categories');
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.request<Product[]>('/home/slider');
  }

  async getBestSellers(): Promise<Product[]> {
    return this.request<Product[]>('/home/best-seller');
  }

  async getBestSelect(): Promise<Product[]> {
    return this.request<Product[]>('/home/best-select');
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    return this.request<Banner[]>('/banners');
  }

  async getBanner(id: string): Promise<Banner> {
    return this.request<Banner>(`/banners/${id}`);
  }

  async createBannerWithImage(formData: FormData): Promise<Banner> {
    const url = `${API_BASE_URL}/banners`;

    const headers: HeadersInit = {};

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async updateBannerWithImage(id: string, formData: FormData): Promise<Banner> {
    const url = `${API_BASE_URL}/banners/${id}`;

    const headers: HeadersInit = {};

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || `HTTP error! status: ${response.status}`;
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async deleteBanner(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/banners/${id}`, {
      method: 'DELETE',
    });
  }

  async getActiveBanners(): Promise<Banner[]> {
    return this.request<Banner[]>('/home/banners');
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/admin/users/${id}`);
  }
}

export const apiService = new ApiService();

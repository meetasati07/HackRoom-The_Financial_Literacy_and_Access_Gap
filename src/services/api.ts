// API service for communicating with the backend
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  coins: number;
  level: string;
  completedQuiz: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: {
    name: string;
    mobile: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await this.request<ApiResponse<null>>('/auth/logout', {
        method: 'POST',
      });
      this.clearToken();
      return response;
    } catch (error) {
      // Even if logout fails on server, clear local token
      this.clearToken();
      throw error;
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/auth/me');
  }

  // User management methods
  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/users/profile');
  }

  async updateUserProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateCoins(coins: number): Promise<ApiResponse<{ coins: number }>> {
    return this.request<ApiResponse<{ coins: number }>>('/users/update-coins', {
      method: 'POST',
      body: JSON.stringify({ coins }),
    });
  }

  async completeQuiz(coins: number, level: string): Promise<ApiResponse<{ user: User }>> {
    return this.request<ApiResponse<{ user: User }>>('/users/complete-quiz', {
      method: 'POST',
      body: JSON.stringify({ coins, level }),
    });
  }

  async deleteAccount(): Promise<ApiResponse<null>> {
    const response = await this.request<ApiResponse<null>>('/users/account', {
      method: 'DELETE',
    });
    this.clearToken();
    return response;
  }

  // Financial data methods
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/financial/dashboard-stats');
  }

  async getMoneyManagementData(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/financial/money-management');
  }

  async getPlatformStats(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/financial/platform-stats');
  }

  // Transaction methods
  async createTransactionOrder(orderData: {
    amount: number;
    description: string;
    category: string;
    merchant: string;
    paymentMethod: string;
    metadata?: any;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/transactions/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async verifyTransaction(transactionData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    description: string;
    category: string;
    merchant: string;
    paymentMethod: string;
    metadata?: any;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/transactions/verify-payment', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactions(queryParams?: string): Promise<ApiResponse<any>> {
    const endpoint = queryParams ? `/transactions?${queryParams}` : '/transactions';
    return this.request<ApiResponse<any>>(endpoint);
  }

  async getTransactionAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/transactions/analytics?period=${period}`);
  }

  async getTransactionById(id: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/transactions/${id}`);
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;

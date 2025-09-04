import axios from 'axios';
import type { 
  LoginData, 
  SignupData, 
  AuthResponse, 
  CreateTicketData, 
  UpdateTicketData,
  Ticket,
  TicketFilters,
  TicketStats,
  ApiResponse
} from '@/types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: any }>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// Tickets API
export const ticketsAPI = {
  create: async (data: CreateTicketData): Promise<ApiResponse<{ ticket: Ticket }>> => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  getAll: async (filters: TicketFilters = {}): Promise<ApiResponse<{ tickets: Ticket[]; pagination: any }>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/tickets?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ ticket: Ticket }>> => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  update: async (id: string, data: UpdateTicketData): Promise<ApiResponse<{ ticket: Ticket }>> => {
    const response = await apiClient.patch(`/tickets/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<TicketStats>> => {
    const response = await apiClient.get('/tickets/stats');
    return response.data;
  },
};

export default apiClient;
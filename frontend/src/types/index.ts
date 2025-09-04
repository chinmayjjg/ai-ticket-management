// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'agent' | 'admin';
  createdAt: string;
}

// Ticket types
export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature-request' | 'bug-report';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: User;
  assignedTo: User;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  attachments?: string[];
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateTicketData {
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: 'agent' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface TicketStats {
  overview: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  byPriority: Array<{ _id: string; count: number }>;
  byCategory: Array<{ _id: string; count: number }>;
}

// Filter types
export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
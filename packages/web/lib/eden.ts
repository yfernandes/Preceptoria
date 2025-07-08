import { treaty } from '@elysiajs/eden';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Import the app type from the backend
// import type { App } from '../../../elysia/src/server';

// Create a basic treaty client for now
// TODO: Once backend is built, uncomment the App import and use: treaty<App>(API_BASE_URL)
export const api = treaty(API_BASE_URL);

// Type definitions for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  errors?: Array<{
    field: string;
    constraints: Record<string, string>;
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

// Auth API using fetch for now (will be replaced with Eden Treaty once types are available)
export const authApi = {
  signup: async (data: { name: string; email: string; phone: string; password: string }): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<User>;
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.message || 'Signup failed',
      };
    }
  },
  
  signin: async (data: { email: string; password: string }): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<User>;
    } catch (error: any) {
      console.error('Signin error:', error);
      return {
        success: false,
        message: error.message || 'Signin failed',
      };
    }
  },
  
  signout: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<void>;
    } catch (error: any) {
      console.error('Signout error:', error);
      return {
        success: false,
        message: error.message || 'Signout failed',
      };
    }
  },

  refresh: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<void>;
    } catch (error: any) {
      console.error('Refresh error:', error);
      return {
        success: false,
        message: error.message || 'Token refresh failed',
      };
    }
  },
};

// Users API using fetch for now
export const usersApi = {
  list: async (params?: { role?: string; limit?: number; offset?: number }): Promise<ApiResponse<User[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await fetch(`${API_BASE_URL}/users?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<User[]>;
    } catch (error: any) {
      console.error('Get users error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch users',
      };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<User>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<User>;
    } catch (error: any) {
      console.error('Get user error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user',
      };
    }
  },
};

// Students API using fetch for now
export const studentsApi = {
  list: async (params?: { classId?: string; supervisorId?: string; limit?: number; offset?: number }): Promise<ApiResponse<any[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.classId) queryParams.append('classId', params.classId);
      if (params?.supervisorId) queryParams.append('supervisorId', params.supervisorId);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await fetch(`${API_BASE_URL}/students?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any[]>;
    } catch (error: any) {
      console.error('Get students error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch students',
      };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get student error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch student',
      };
    }
  },
};

// Documents API using fetch for now
export const documentsApi = {
  list: async (params?: { studentId?: string; type?: string; status?: string; limit?: number; offset?: number }): Promise<ApiResponse<any[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.studentId) queryParams.append('studentId', params.studentId);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await fetch(`${API_BASE_URL}/documents?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any[]>;
    } catch (error: any) {
      console.error('Get documents error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch documents',
      };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get document error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch document',
      };
    }
  },
};

// Shifts API using fetch for now
export const shiftsApi = {
  list: async (params?: { hospitalId?: string; preceptorId?: string; studentId?: string; date?: string; limit?: number; offset?: number }): Promise<ApiResponse<any[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.hospitalId) queryParams.append('hospitalId', params.hospitalId);
      if (params?.preceptorId) queryParams.append('preceptorId', params.preceptorId);
      if (params?.studentId) queryParams.append('studentId', params.studentId);
      if (params?.date) queryParams.append('date', params.date);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await fetch(`${API_BASE_URL}/shifts?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any[]>;
    } catch (error: any) {
      console.error('Get shifts error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch shifts',
      };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get shift error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch shift',
      };
    }
  },
};

// Classes API using fetch for now
export const classesApi = {
  list: async (params?: { courseId?: string; supervisorId?: string; limit?: number; offset?: number }): Promise<ApiResponse<any[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.courseId) queryParams.append('courseId', params.courseId);
      if (params?.supervisorId) queryParams.append('supervisorId', params.supervisorId);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await fetch(`${API_BASE_URL}/classes?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any[]>;
    } catch (error: any) {
      console.error('Get classes error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch classes',
      };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get class error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch class',
      };
    }
  },
};

// Courses API using fetch for now
export const coursesApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<ApiResponse<any[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await fetch(`${API_BASE_URL}/courses?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any[]>;
    } catch (error: any) {
      console.error('Get courses error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch courses',
      };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get course error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch course',
      };
    }
  },
};

// Hospitals API using fetch for now
export const hospitalsApi = {
  list: async (params?: { limit?: number; offset?: number }): Promise<ApiResponse<any[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      
      const response = await fetch(`${API_BASE_URL}/hospitals?${queryParams.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any[]>;
    } catch (error: any) {
      console.error('Get hospitals error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch hospitals',
      };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${id}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get hospital error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch hospital',
      };
    }
  },
};

// Admin API using fetch for now
export const adminApi = {
  stats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Get admin stats error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch admin stats',
      };
    }
  },
};

// Health check using fetch for now
export const healthApi = {
  check: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        credentials: 'include',
      });
      
      const result = await response.json();
      return result as ApiResponse<any>;
    } catch (error: any) {
      console.error('Health check error:', error);
      return {
        success: false,
        message: error.message || 'Health check failed',
      };
    }
  },
};

// Export all APIs
export const edenApi = {
  auth: authApi,
  users: usersApi,
  students: studentsApi,
  documents: documentsApi,
  shifts: shiftsApi,
  classes: classesApi,
  courses: coursesApi,
  hospitals: hospitalsApi,
  admin: adminApi,
  health: healthApi,
};

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Promise<ApiResponse<T>>): Promise<T> {
  try {
    const result = await response;
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    return (result.data || result.user) as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper function to handle file uploads
export async function uploadFile(file: File, endpoint: string, additionalData?: Record<string, any>): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    const data = await response.json();
    return data as ApiResponse<any>;
  } catch (error: any) {
    console.error('File upload error:', error);
    return {
      success: false,
      message: error.message || 'File upload failed',
    };
  }
} 
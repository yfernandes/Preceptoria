import { treaty } from '@elysiajs/eden';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// TODO: Import the actual app type from the backend
// import type { App } from '../../../elysia/src/index';

// For now, we'll create a basic treaty client without strict typing
// This will be updated once we have the proper app type
export const api = treaty(API_BASE_URL);

// Type-safe API functions using fetch for now
// We'll replace these with Eden Treaty calls once we have proper types

export const authApi = {
  signup: async (data: { name: string; email: string; phone: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  signin: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  signout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
    });
    return response.json();
  },
  
  me: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
    });
    return response.json();
  },
};

export const usersApi = {
  list: async (params?: { role?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/users?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  create: async (data: { name: string; email: string; phone: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: string, data: Partial<{ name: string; email: string; phone: string }>) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const studentsApi = {
  list: async (params?: { classId?: string; supervisorId?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.classId) queryParams.append('classId', params.classId);
    if (params?.supervisorId) queryParams.append('supervisorId', params.supervisorId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/students?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  create: async (data: { name: string; email: string; phone: string; classId: string }) => {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: string, data: Partial<{ name: string; email: string; phone: string; classId: string }>) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const documentsApi = {
  list: async (params?: { studentId?: string; type?: string; status?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/documents?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  upload: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      body: data,
    });
    return response.json();
  },
  
  update: async (id: string, data: Partial<{ name: string; type: string; status: string }>) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  approve: async (id: string, data?: { notes?: string }) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  reject: async (id: string, data: { reason: string; notes?: string }) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export const shiftsApi = {
  list: async (params?: { hospitalId?: string; preceptorId?: string; studentId?: string; date?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.hospitalId) queryParams.append('hospitalId', params.hospitalId);
    if (params?.preceptorId) queryParams.append('preceptorId', params.preceptorId);
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/shifts?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  create: async (data: { date: string; startTime: string; endTime: string; hospitalId: string; preceptorId: string; studentIds: string[] }) => {
    const response = await fetch(`${API_BASE_URL}/shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: string, data: Partial<{ date: string; startTime: string; endTime: string; hospitalId: string; preceptorId: string; studentIds: string[] }>) => {
    const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/shifts/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const classesApi = {
  list: async (params?: { courseId?: string; supervisorId?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append('courseId', params.courseId);
    if (params?.supervisorId) queryParams.append('supervisorId', params.supervisorId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/classes?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  create: async (data: { name: string; courseId: string; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: string, data: Partial<{ name: string; courseId: string; description?: string }>) => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const coursesApi = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/courses?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  create: async (data: { name: string; description?: string }) => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: string, data: Partial<{ name: string; description?: string }>) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const hospitalsApi = {
  list: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(`${API_BASE_URL}/hospitals?${queryParams.toString()}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  get: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${id}`, {
      method: 'GET',
    });
    return response.json();
  },
  
  create: async (data: { name: string; address?: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/hospitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  update: async (id: string, data: Partial<{ name: string; address?: string; phone?: string }>) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/hospitals/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const adminApi = {
  stats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
    });
    return response.json();
  },
  
  users: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
    });
    return response.json();
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.json();
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
export async function handleApiResponse<T>(response: Promise<{ data: T; error?: any }>) {
  try {
    const result = await response;
    if (result.error) {
      throw new Error(result.error);
    }
    return result.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper function to handle file uploads
export async function uploadFile(file: File, endpoint: string, additionalData?: Record<string, any>) {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
} 
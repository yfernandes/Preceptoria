// API Client for Preceptoria Frontend
// Communicates with Elysia.js backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    constraints: Record<string, string>;
  }>;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
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

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  crefito?: string;
  class?: {
    id: string;
    name: string;
  };
  supervisor?: {
    id: string;
    name: string;
  };
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  student: {
    id: string;
    name: string;
    crefito: string;
  };
  validationChecks?: Record<string, boolean>;
  validationNotes?: string;
  rejectionReason?: string;
  uploadedAt: string;
}

export interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hospital: {
    id: string;
    name: string;
  };
  preceptor: {
    id: string;
    name: string;
  };
  students: Array<{
    id: string;
    name: string;
  }>;
}

export interface Class {
  id: string;
  name: string;
  description?: string;
  course?: {
    id: string;
    name: string;
  };
  students?: Array<{
    id: string;
    name: string;
  }>;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  classes?: Array<{
    id: string;
    name: string;
  }>;
}

export interface Hospital {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalShifts: number;
  totalDocuments: number;
  activeClasses: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async signup(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.request<User>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      // Extract token from response headers or cookies
      // This depends on how your backend sends the token
      const token = response.data.token || this.extractTokenFromResponse(response);
      if (token) {
        this.setToken(token);
      }
    }

    return response;
  }

  async signout(): Promise<void> {
    this.clearToken();
    // Optionally call backend logout endpoint
    try {
      await this.request('/auth/signout', { method: 'POST' });
    } catch (error) {
      // Ignore errors on logout
    }
  }

  private extractTokenFromResponse(response: any): string | null {
    // This is a placeholder - implement based on your backend token delivery method
    return response.token || null;
  }

  // Users
  async getUsers(params?: {
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<User[]>> {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append('role', params.role);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<User[]>(`/users?${queryParams.toString()}`);
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

  // Students
  async getStudents(params?: {
    classId?: string;
    supervisorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Student[]>> {
    const queryParams = new URLSearchParams();
    if (params?.classId) queryParams.append('classId', params.classId);
    if (params?.supervisorId) queryParams.append('supervisorId', params.supervisorId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<Student[]>(`/students?${queryParams.toString()}`);
  }

  async getStudent(id: string): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/students/${id}`);
  }

  async createStudent(studentData: {
    name: string;
    email: string;
    phone: string;
    classId: string;
  }): Promise<ApiResponse<Student>> {
    return this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: string, studentData: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  // Documents
  async getDocuments(params?: {
    studentId?: string;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Document[]>> {
    const queryParams = new URLSearchParams();
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<Document[]>(`/documents?${queryParams.toString()}`);
  }

  async getDocument(id: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/documents/${id}`);
  }

  async uploadDocument(documentData: FormData): Promise<ApiResponse<Document>> {
    const url = `${this.baseURL}/documents`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: documentData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Document upload failed');
    }

    return data;
  }

  async updateDocument(id: string, documentData: Partial<Document>): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async approveDocument(id: string, notes?: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/documents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectDocument(id: string, reason: string, notes?: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/documents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, notes }),
    });
  }

  // Shifts
  async getShifts(params?: {
    hospitalId?: string;
    preceptorId?: string;
    studentId?: string;
    date?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Shift[]>> {
    const queryParams = new URLSearchParams();
    if (params?.hospitalId) queryParams.append('hospitalId', params.hospitalId);
    if (params?.preceptorId) queryParams.append('preceptorId', params.preceptorId);
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    if (params?.date) queryParams.append('date', params.date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<Shift[]>(`/shifts?${queryParams.toString()}`);
  }

  async getShift(id: string): Promise<ApiResponse<Shift>> {
    return this.request<Shift>(`/shifts/${id}`);
  }

  async createShift(shiftData: {
    date: string;
    startTime: string;
    endTime: string;
    hospitalId: string;
    preceptorId: string;
    studentIds: string[];
  }): Promise<ApiResponse<Shift>> {
    return this.request<Shift>('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
  }

  async updateShift(id: string, shiftData: Partial<Shift>): Promise<ApiResponse<Shift>> {
    return this.request<Shift>(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shiftData),
    });
  }

  async deleteShift(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/shifts/${id}`, {
      method: 'DELETE',
    });
  }

  // Classes
  async getClasses(params?: {
    courseId?: string;
    supervisorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Class[]>> {
    const queryParams = new URLSearchParams();
    if (params?.courseId) queryParams.append('courseId', params.courseId);
    if (params?.supervisorId) queryParams.append('supervisorId', params.supervisorId);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<Class[]>(`/classes?${queryParams.toString()}`);
  }

  async getClass(id: string): Promise<ApiResponse<Class>> {
    return this.request<Class>(`/classes/${id}`);
  }

  async createClass(classData: {
    name: string;
    courseId: string;
    description?: string;
  }): Promise<ApiResponse<Class>> {
    return this.request<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  }

  async updateClass(id: string, classData: Partial<Class>): Promise<ApiResponse<Class>> {
    return this.request<Class>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  }

  async deleteClass(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  // Courses
  async getCourses(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Course[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<Course[]>(`/courses?${queryParams.toString()}`);
  }

  async getCourse(id: string): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${id}`);
  }

  // Hospitals
  async getHospitals(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Hospital[]>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request<Hospital[]>(`/hospitals?${queryParams.toString()}`);
  }

  async getHospital(id: string): Promise<ApiResponse<Hospital>> {
    return this.request<Hospital>(`/hospitals/${id}`);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>('/admin/stats');
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }>> {
    return this.request('/health');
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type {
  User,
  Student,
  Document,
  Shift,
  Class,
  Course,
  Hospital,
  DashboardStats,
}; 
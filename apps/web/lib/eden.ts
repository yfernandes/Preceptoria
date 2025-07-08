import { App } from "@api";
import { treaty } from "@elysiajs/eden";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Create a basic treaty client for now
// TODO: Once we resolve the monorepo type issues, we can use: treaty<App>(API_BASE_URL)
export const treatise = treaty<App>(API_BASE_URL);

// Type definitions for API responses based on our endpoints.yaml
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

export interface PaginatedResponse<T> {
	success: boolean;
	data: T[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}

// User types based on our entities
export interface User {
	id: string;
	name: string;
	email: string;
	phone: string;
	roles: string[];
	createdAt: string;
	updatedAt: string;
}

export interface Student {
	id: string;
	enrollmentNumber: string;
	user: User;
	class: any;
	shifts: any[];
	createdAt: string;
	updatedAt: string;
}

export interface Class {
	id: string;
	name: string;
	course: any;
	students: any[];
	createdAt: string;
	updatedAt: string;
}

export interface Course {
	id: string;
	name: string;
	description: string;
	school: any;
	supervisor: any;
	classes: any[];
	createdAt: string;
	updatedAt: string;
}

export interface School {
	id: string;
	name: string;
	address: string;
	orgAdmin: any;
	courses: any[];
	createdAt: string;
	updatedAt: string;
}

export interface Hospital {
	id: string;
	name: string;
	address: string;
	orgAdmin: any;
	shifts: any[];
	createdAt: string;
	updatedAt: string;
}

export interface Shift {
	id: string;
	name: string;
	startDate: string;
	endDate: string;
	hospital: any;
	student: any;
	preceptor: any;
	createdAt: string;
	updatedAt: string;
}

export interface Preceptor {
	id: string;
	professionalIdentityNumber: string;
	user: User;
	hospital: any;
	shifts: any[];
	createdAt: string;
	updatedAt: string;
}

export interface Supervisor {
	id: string;
	user: User;
	school: any;
	courses: any[];
	createdAt: string;
	updatedAt: string;
}

export interface Document {
	id: string;
	name: string;
	description: string;
	type: string;
	student: any;
	submissions: any[];
	createdAt: string;
	updatedAt: string;
}

// Auth API using Eden Treaty
export const authApi = {
	signup: async (data: {
		name: string;
		email: string;
		phone: string;
		password: string;
	}): Promise<ApiResponse<User>> => {
		const response = await treatise.auth.signup.post(data);
		return response.data as ApiResponse<User>;
	},

	signin: async (data: {
		email: string;
		password: string;
	}): Promise<ApiResponse<User>> => {
		const response = await treatise.auth.signin.post(data);
		return response.data as ApiResponse<User>;
	},

	signout: async (): Promise<ApiResponse<void>> => {
		const response = await treatise.auth.logout.post();
		return response.data as ApiResponse<void>;
	},

	refresh: async (): Promise<ApiResponse<void>> => {
		const response = await treatise.auth.refresh.post();
		return response.data as ApiResponse<void>;
	},
};


// Students API using Eden Treaty
export const studentsApi = {
  list: async (params?: { classId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Student>> => {
    const response = await treatise.students.get({ query: params });
    return response.data as PaginatedResponse<Student>;
  },

  get: async (id: string): Promise<ApiResponse<Student>> => {
    const response = await treatise.students({ id }).get();
    return response.data as ApiResponse<Student>;
  },

  create: async (data: { userId: string; enrollmentNumber: string; classId: string }): Promise<ApiResponse<Student>> => {
    const response = await treatise.students.post(data);
    return response.data as ApiResponse<Student>;
  },

  update: async (id: string, data: Partial<{ enrollmentNumber: string; classId: string }>): Promise<ApiResponse<Student>> => {
    const response = await treatise.students({ id }).patch(data);
    return response.data as ApiResponse<Student>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.students({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Classes API using Eden Treaty
export const classesApi = {
  list: async (params?: { courseId?: string; supervisorId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Class>> => {
    const response = await treatise.classes.get({ query: params });
    return response.data as PaginatedResponse<Class>;
  },

  get: async (id: string): Promise<ApiResponse<Class>> => {
    const response = await treatise.classes({ id }).get();
    return response.data as ApiResponse<Class>;
  },

  create: async (data: { name: string; courseId: string }): Promise<ApiResponse<Class>> => {
    const response = await treatise.classes.post(data);
    return response.data as ApiResponse<Class>;
  },

  update: async (id: string, data: Partial<{ name: string; courseId: string }>): Promise<ApiResponse<Class>> => {
    const response = await treatise.classes({ id }).patch(data);
    return response.data as ApiResponse<Class>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.classes({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Courses API using Eden Treaty
export const coursesApi = {
  list: async (params?: { schoolId?: string; supervisorId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Course>> => {
    const response = await treatise.courses.get({ query: params });
    return response.data as PaginatedResponse<Course>;
  },

  get: async (id: string): Promise<ApiResponse<Course>> => {
    const response = await treatise.courses({ id }).get();
    return response.data as ApiResponse<Course>;
  },

  create: async (data: { name: string; description: string; schoolId: string; supervisorId: string }): Promise<ApiResponse<Course>> => {
    const response = await treatise.courses.post(data);
    return response.data as ApiResponse<Course>;
  },

  update: async (id: string, data: Partial<{ name: string; description: string; schoolId: string; supervisorId: string }>): Promise<ApiResponse<Course>> => {
    const response = await treatise.courses({ id }).patch(data);
    return response.data as ApiResponse<Course>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.courses({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Schools API using Eden Treaty
export const schoolsApi = {
  list: async (params?: { orgAdminId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<School>> => {
    const response = await treatise.schools.get({ query: params });
    return response.data as PaginatedResponse<School>;
  },

  get: async (id: string): Promise<ApiResponse<School>> => {
    const response = await treatise.schools({ id }).get();
    return response.data as ApiResponse<School>;
  },

  create: async (data: { name: string; address: string; orgAdminId: string }): Promise<ApiResponse<School>> => {
    const response = await treatise.schools.post(data);
    return response.data as ApiResponse<School>;
  },

  update: async (id: string, data: Partial<{ name: string; address: string; orgAdminId: string }>): Promise<ApiResponse<School>> => {
    const response = await treatise.schools({ id }).patch(data);
    return response.data as ApiResponse<School>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.schools({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Hospitals API using Eden Treaty
export const hospitalsApi = {
  list: async (params?: { orgAdminId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Hospital>> => {
    const response = await treatise.hospitals.get({ query: params });
    return response.data as PaginatedResponse<Hospital>;
  },

  get: async (id: string): Promise<ApiResponse<Hospital>> => {
    const response = await treatise.hospitals({ id }).get();
    return response.data as ApiResponse<Hospital>;
  },

  create: async (data: { name: string; address: string; orgAdminId: string }): Promise<ApiResponse<Hospital>> => {
    const response = await treatise.hospitals.post(data);
    return response.data as ApiResponse<Hospital>;
  },

  update: async (id: string, data: Partial<{ name: string; address: string; orgAdminId: string }>): Promise<ApiResponse<Hospital>> => {
    const response = await treatise.hospitals({ id }).patch(data);
    return response.data as ApiResponse<Hospital>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.hospitals({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Shifts API using Eden Treaty
export const shiftsApi = {
  list: async (params?: { hospitalId?: string; studentId?: string; preceptorId?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Shift>> => {
    const response = await treatise.shifts.get({ query: params });
    return response.data as PaginatedResponse<Shift>;
  },

  get: async (id: string): Promise<ApiResponse<Shift>> => {
    const response = await treatise.shifts({ id }).get();
    return response.data as ApiResponse<Shift>;
  },

  create: async (data: { name: string; startDate: string; endDate: string; hospitalId: string; studentId: string; preceptorId: string }): Promise<ApiResponse<Shift>> => {
    const response = await treatise.shifts.post(data);
    return response.data as ApiResponse<Shift>;
  },

  update: async (id: string, data: Partial<{ name: string; startDate: string; endDate: string; hospitalId: string; studentId: string; preceptorId: string }>): Promise<ApiResponse<Shift>> => {
    const response = await treatise.shifts({ id }).patch(data);
    return response.data as ApiResponse<Shift>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.shifts({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Preceptors API using Eden Treaty
export const preceptorsApi = {
  list: async (params?: { hospitalId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Preceptor>> => {
    const response = await treatise.preceptors.get({ query: params });
    return response.data as PaginatedResponse<Preceptor>;
  },

  get: async (id: string): Promise<ApiResponse<Preceptor>> => {
    const response = await treatise.preceptors({ id }).get();
    return response.data as ApiResponse<Preceptor>;
  },

  create: async (data: { userId: string; professionalIdentityNumber: string; hospitalId: string }): Promise<ApiResponse<Preceptor>> => {
    const response = await treatise.preceptors.post(data);
    return response.data as ApiResponse<Preceptor>;
  },

  update: async (id: string, data: Partial<{ professionalIdentityNumber: string; hospitalId: string }>): Promise<ApiResponse<Preceptor>> => {
    const response = await treatise.preceptors({ id }).patch(data);
    return response.data as ApiResponse<Preceptor>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.preceptors({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Supervisors API using Eden Treaty
export const supervisorsApi = {
  list: async (params?: { schoolId?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Supervisor>> => {
    const response = await treatise.supervisors.get({ query: params });
    return response.data as PaginatedResponse<Supervisor>;
  },

  get: async (id: string): Promise<ApiResponse<Supervisor>> => {
    const response = await treatise.supervisors({ id }).get();
    return response.data as ApiResponse<Supervisor>;
  },

  create: async (data: { userId: string; schoolId: string }): Promise<ApiResponse<Supervisor>> => {
    const response = await treatise.supervisors.post(data);
    return response.data as ApiResponse<Supervisor>;
  },

  update: async (id: string, data: Partial<{ schoolId: string }>): Promise<ApiResponse<Supervisor>> => {
    const response = await treatise.supervisors({ id }).patch(data);
    return response.data as ApiResponse<Supervisor>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.supervisors({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};


// Admin API using Eden Treaty
export const adminApi = {
  create: async (data: { userId: string }): Promise<ApiResponse<any>> => {
    const response = await treatise.admin.post(data);
    return response.data as ApiResponse<any>;
  },

  syncGoogleSheets: async (): Promise<ApiResponse<any>> => {
    const response = await treatise.admin['sync-google-sheets'].post();
    return response.data as ApiResponse<any>;
  },

  get: async (id: string): Promise<ApiResponse<any>> => {
    const response = await treatise.admin({ id }).get();
    return response.data as ApiResponse<any>;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await treatise.admin({ id }).delete();
    return response.data as ApiResponse<void>;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string; uptime: number; environment: string }> => {
    const response = await treatise.health.;
    return response.data;
  },
};

// Utility functions
export async function handleApiResponse<T>(response: Promise<ApiResponse<T>>): Promise<T> {
  const result = await response;
  if (!result.success) {
    throw new Error(result.message || 'API request failed');
  }
  return result.data || result.user as T;
}

export async function uploadFile(file: File, endpoint: string, additionalData?: Record<string, any>): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  return response.json();
}


// Users API using Eden Treaty
// export const usersApi = {
//   list: async (params?: { role?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<User>> => {
//     const response = await treatise.users.get({ query: params });
//     return response.data as PaginatedResponse<User>;
//   },

//   get: async (id: string): Promise<ApiResponse<User>> => {
//     const response = await treatise.users({ id }).get();
//     return response.data as ApiResponse<User>;
//   },

//   create: async (data: { name: string; email: string; phone: string; password: string }): Promise<ApiResponse<User>> => {
//     const response = await treatise.users.post(data);
//     return response.data as ApiResponse<User>;
//   },

//   update: async (id: string, data: Partial<{ name: string; email: string; phone: string; password: string }>): Promise<ApiResponse<User>> => {
//     const response = await treatise.users({ id }).patch(data);
//     return response.data as ApiResponse<User>;
//   },

//   delete: async (id: string): Promise<ApiResponse<void>> => {
//     const response = await treatise.users({ id }).delete();
//     return response.data as ApiResponse<void>;
//   },
// };

// Documents API using Eden Treaty
// export const documentsApi = {
//   list: async (params?: { studentId?: string; type?: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Document>> => {
//     const response = await treatise.documents.get({ query: params });
//     return response.data as PaginatedResponse<Document>;
//   },

//   get: async (id: string): Promise<ApiResponse<Document>> => {
//     const response = await treatise.documents({ id }).get();
//     return response.data as ApiResponse<Document>;
//   },

//   create: async (data: { name: string; description: string; studentId: string; type: string }): Promise<ApiResponse<Document>> => {
//     const response = await treatise.documents.post(data);
//     return response.data as ApiResponse<Document>;
//   },

//   update: async (id: string, data: Partial<{ name: string; description: string; type: string }>): Promise<ApiResponse<Document>> => {
//     const response = await treatise.documents({ id }).patch(data);
//     return response.data as ApiResponse<Document>;
//   },

//   delete: async (id: string): Promise<ApiResponse<void>> => {
//     const response = await treatise.documents({ id }).delete();
//     return response.data as ApiResponse<void>;
//   },

//   submit: async (id: string, data: { file: File; notes?: string }): Promise<ApiResponse<any>> => {
//     const response = await treatise.documents({ id }).submit.post(data);
//     return response.data as ApiResponse<any>;
//   },

//   approve: async (id: string, data: { submissionId: string; feedback?: string }): Promise<ApiResponse<any>> => {
//     const response = await treatise.documents({ id }).approve.post(data);
//     return response.data as ApiResponse<any>;
//   },

//   reject: async (id: string, data: { submissionId: string; feedback: string }): Promise<ApiResponse<any>> => {
//     const response = await treatise.documents({ id }).reject.post(data);
//     return response.data as ApiResponse<any>;
//   },

//   getValidationTemplates: async (): Promise<ApiResponse<any[]>> => {
//     const response = await treatise.documents['validation-templates'].get();
//     return response.data as ApiResponse<any[]>;
//   },

//   validate: async (id: string, data: { submissionId: string }): Promise<ApiResponse<any>> => {
//     const response = await treatise.documents({ id }).validate.post(data);
//     return response.data as ApiResponse<any>;
//   },

//   getPendingStats: async (): Promise<ApiResponse<any>> => {
//     const response = await treatise.documents.stats.pending.get();
//     return response.data as ApiResponse<any>;
//   },
// };

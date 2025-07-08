// Proper Eden Treaty implementation
// This file shows how to use Eden Treaty correctly once we have the app types from the backend

import { treaty } from '@elysiajs/eden';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// TODO: Import the actual app type from the backend
// import type { App } from '../../../elysia/src/index';

// Once we have the app type, we can create a properly typed treaty client:
// export const api = treaty<App>(API_BASE_URL);

// For now, we'll use a basic treaty client
export const api = treaty(API_BASE_URL);

// Example of how to use Eden Treaty properly once we have types:

/*
// With proper typing, you would be able to do:
const response = await api.auth.signin.post({
  email: "user@example.com",
  password: "password123"
});

// And TypeScript would know the exact response type
const user = response.data.user; // Fully typed!

// For GET requests with query parameters:
const users = await api.users.get({
  query: {
    role: "student",
    limit: 10,
    offset: 0
  }
});

// For dynamic routes:
const user = await api.users({ id: "123" }).get();

// For POST requests with body:
const newUser = await api.users.post({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  password: "password123"
});
*/

// Type definitions for our API responses
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

// This is how you would implement the auth API with proper Eden Treaty typing:
export const authApiProper = {
  signup: async (data: { name: string; email: string; phone: string; password: string }): Promise<ApiResponse<User>> => {
    // With proper typing, this would be:
    // const response = await api.auth.signup.post(data);
    // return response.data as ApiResponse<User>;
    
    // For now, we'll use fetch until we have proper types
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    const result = await response.json();
    return result as ApiResponse<User>;
  },
  
  signin: async (data: { email: string; password: string }): Promise<ApiResponse<User>> => {
    // With proper typing, this would be:
    // const response = await api.auth.signin.post(data);
    // return response.data as ApiResponse<User>;
    
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    const result = await response.json();
    return result as ApiResponse<User>;
  },
  
  signout: async (): Promise<ApiResponse<void>> => {
    // With proper typing, this would be:
    // const response = await api.auth.logout.post();
    // return response.data as ApiResponse<void>;
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    const result = await response.json();
    return result as ApiResponse<void>;
  },

  refresh: async (): Promise<ApiResponse<void>> => {
    // With proper typing, this would be:
    // const response = await api.auth.refresh.post();
    // return response.data as ApiResponse<void>;
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    const result = await response.json();
    return result as ApiResponse<void>;
  },
};

// Example of how to use Eden Treaty for other endpoints:

/*
// Users API
export const usersApiProper = {
  list: async (params?: { role?: string; limit?: number; offset?: number }) => {
    // With proper typing:
    // const response = await api.users.get({ query: params });
    // return response.data;
  },
  
  get: async (id: string) => {
    // With proper typing:
    // const response = await api.users({ id }).get();
    // return response.data;
  },
  
  create: async (data: { name: string; email: string; phone: string; password: string }) => {
    // With proper typing:
    // const response = await api.users.post(data);
    // return response.data;
  },
  
  update: async (id: string, data: Partial<{ name: string; email: string; phone: string }>) => {
    // With proper typing:
    // const response = await api.users({ id }).put(data);
    // return response.data;
  },
  
  delete: async (id: string) => {
    // With proper typing:
    // const response = await api.users({ id }).delete();
    // return response.data;
  },
};
*/

// Instructions for setting up proper Eden Treaty:

/*
1. In your Elysia backend, export the app type:
   export type App = typeof app;

2. In your frontend, import the app type:
   import type { App } from '../../../elysia/src/index';

3. Create the treaty client with the app type:
   export const api = treaty<App>(API_BASE_URL);

4. Now you'll have full type safety and autocomplete!

Example usage with proper typing:
- api.auth.signin.post() will have full type checking for the request body
- The response will be fully typed based on your Elysia route definitions
- Query parameters will be validated at compile time
- Route parameters will be checked for existence
*/

// The authApiProper is already exported above 
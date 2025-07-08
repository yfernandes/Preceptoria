import type React from "react"

// ========================================
// API TYPES (from eden.ts)
// ========================================

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

// ========================================
// UI TYPES
// ========================================

export interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isActive: boolean;
}

export interface SearchResult {
  type: string;
  name: string;
  id: string;
}

// ========================================
// DASHBOARD TYPES (Enhanced with real data)
// ========================================

export interface DashboardStats {
  totalClasses: number;
  completedClasses: number;
  classesNeedingAttention: number;
  todayShifts: number;
}

export interface ClassData {
  id: string;
  name: string;
  course: Course;
  progress: number;
  status: "Concluído" | "Em Andamento" | "Pendente Revisão" | "Início do Processo";
  studentsCount: number;
  documentsApproved: number;
  documentsTotal: number;
  lastUpdate: string;
  issues: number;
}

export interface ShiftData {
  id: string;
  date: string;
  time: string;
  class: Class;
  preceptor: Preceptor;
  students: Student[];
  location: Hospital;
}

// ========================================
// FORM TYPES
// ========================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface StudentFormData {
  userId: string;
  enrollmentNumber: string;
  classId: string;
}

export interface ClassFormData {
  name: string;
  courseId: string;
}

export interface CourseFormData {
  name: string;
  description: string;
  schoolId: string;
  supervisorId: string;
}

export interface SchoolFormData {
  name: string;
  address: string;
  orgAdminId: string;
}

export interface HospitalFormData {
  name: string;
  address: string;
  orgAdminId: string;
}

export interface ShiftFormData {
  name: string;
  startDate: string;
  endDate: string;
  hospitalId: string;
  studentId: string;
  preceptorId: string;
}

export interface PreceptorFormData {
  userId: string;
  professionalIdentityNumber: string;
  hospitalId: string;
}

export interface SupervisorFormData {
  userId: string;
  schoolId: string;
}

export interface DocumentFormData {
  name: string;
  description: string;
  studentId: string;
  type: string;
}

// ========================================
// FILTER TYPES
// ========================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface UserFilters extends PaginationParams {
  role?: string;
}

export interface StudentFilters extends PaginationParams {
  classId?: string;
}

export interface ClassFilters extends PaginationParams {
  courseId?: string;
  supervisorId?: string;
}

export interface CourseFilters extends PaginationParams {
  schoolId?: string;
  supervisorId?: string;
}

export interface SchoolFilters extends PaginationParams {
  orgAdminId?: string;
}

export interface HospitalFilters extends PaginationParams {
  orgAdminId?: string;
}

export interface ShiftFilters extends PaginationParams {
  hospitalId?: string;
  studentId?: string;
  preceptorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PreceptorFilters extends PaginationParams {
  hospitalId?: string;
}

export interface SupervisorFilters extends PaginationParams {
  schoolId?: string;
}

export interface DocumentFilters extends PaginationParams {
  studentId?: string;
  type?: string;
}

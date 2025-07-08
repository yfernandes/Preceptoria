import { useState, useCallback } from 'react';
import { 
  authApi, 
  usersApi, 
  studentsApi, 
  classesApi, 
  coursesApi, 
  schoolsApi, 
  hospitalsApi, 
  shiftsApi, 
  preceptorsApi, 
  supervisorsApi, 
  documentsApi, 
  adminApi, 
  healthApi,
  ApiResponse,
  PaginatedResponse 
} from '@/lib/eden';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

interface UsePaginatedApiState<T> {
  data: T[] | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null;
  loading: boolean;
  error: string | null;
}

interface UsePaginatedApiReturn<T> extends UsePaginatedApiState<T> {
  execute: (...args: any[]) => Promise<T[] | null>;
  reset: () => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiFunction(...args);
        
        if (response.success && (response.data || response.user)) {
          const data = response.data || response.user;
          setState({
            data: data || null,
            loading: false,
            error: null,
          });
          return data || null;
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function usePaginatedApi<T = any>(
  apiFunction: (...args: any[]) => Promise<PaginatedResponse<T>>
): UsePaginatedApiReturn<T> {
  const [state, setState] = useState<UsePaginatedApiState<T>>({
    data: null,
    pagination: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T[] | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiFunction(...args);
        
        if (response.success && response.data) {
          setState({
            data: response.data,
            pagination: response.pagination,
            loading: false,
            error: null,
          });
          return response.data;
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setState({
          data: null,
          pagination: null,
          loading: false,
          error: errorMessage,
        });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      pagination: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// ========================================
// AUTHENTICATION HOOKS
// ========================================

export function useAuth() {
  const signin = useApi(authApi.signin);
  const signup = useApi(authApi.signup);
  const signout = useApi(authApi.signout);
  const refresh = useApi(authApi.refresh);

  return {
    signin,
    signup,
    signout,
    refresh,
  };
}

// ========================================
// USER MANAGEMENT HOOKS
// ========================================

export function useUsers() {
  const list = usePaginatedApi(usersApi.list);
  const get = useApi(usersApi.get);
  const create = useApi(usersApi.create);
  const update = useApi(usersApi.update);
  const remove = useApi(usersApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// STUDENT MANAGEMENT HOOKS
// ========================================

export function useStudents() {
  const list = usePaginatedApi(studentsApi.list);
  const get = useApi(studentsApi.get);
  const create = useApi(studentsApi.create);
  const update = useApi(studentsApi.update);
  const remove = useApi(studentsApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// CLASS MANAGEMENT HOOKS
// ========================================

export function useClasses() {
  const list = usePaginatedApi(classesApi.list);
  const get = useApi(classesApi.get);
  const create = useApi(classesApi.create);
  const update = useApi(classesApi.update);
  const remove = useApi(classesApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// COURSE MANAGEMENT HOOKS
// ========================================

export function useCourses() {
  const list = usePaginatedApi(coursesApi.list);
  const get = useApi(coursesApi.get);
  const create = useApi(coursesApi.create);
  const update = useApi(coursesApi.update);
  const remove = useApi(coursesApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// SCHOOL MANAGEMENT HOOKS
// ========================================

export function useSchools() {
  const list = usePaginatedApi(schoolsApi.list);
  const get = useApi(schoolsApi.get);
  const create = useApi(schoolsApi.create);
  const update = useApi(schoolsApi.update);
  const remove = useApi(schoolsApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// HOSPITAL MANAGEMENT HOOKS
// ========================================

export function useHospitals() {
  const list = usePaginatedApi(hospitalsApi.list);
  const get = useApi(hospitalsApi.get);
  const create = useApi(hospitalsApi.create);
  const update = useApi(hospitalsApi.update);
  const remove = useApi(hospitalsApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// SHIFT MANAGEMENT HOOKS
// ========================================

export function useShifts() {
  const list = usePaginatedApi(shiftsApi.list);
  const get = useApi(shiftsApi.get);
  const create = useApi(shiftsApi.create);
  const update = useApi(shiftsApi.update);
  const remove = useApi(shiftsApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// PRECEPTOR MANAGEMENT HOOKS
// ========================================

export function usePreceptors() {
  const list = usePaginatedApi(preceptorsApi.list);
  const get = useApi(preceptorsApi.get);
  const create = useApi(preceptorsApi.create);
  const update = useApi(preceptorsApi.update);
  const remove = useApi(preceptorsApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// SUPERVISOR MANAGEMENT HOOKS
// ========================================

export function useSupervisors() {
  const list = usePaginatedApi(supervisorsApi.list);
  const get = useApi(supervisorsApi.get);
  const create = useApi(supervisorsApi.create);
  const update = useApi(supervisorsApi.update);
  const remove = useApi(supervisorsApi.delete);

  return {
    list,
    get,
    create,
    update,
    remove,
  };
}

// ========================================
// DOCUMENT MANAGEMENT HOOKS
// ========================================

export function useDocuments() {
  const list = usePaginatedApi(documentsApi.list);
  const get = useApi(documentsApi.get);
  const create = useApi(documentsApi.create);
  const update = useApi(documentsApi.update);
  const remove = useApi(documentsApi.delete);
  const submit = useApi(documentsApi.submit);
  const approve = useApi(documentsApi.approve);
  const reject = useApi(documentsApi.reject);
  const getValidationTemplates = useApi(documentsApi.getValidationTemplates);
  const validate = useApi(documentsApi.validate);
  const getPendingStats = useApi(documentsApi.getPendingStats);

  return {
    list,
    get,
    create,
    update,
    remove,
    submit,
    approve,
    reject,
    getValidationTemplates,
    validate,
    getPendingStats,
  };
}

// ========================================
// ADMIN MANAGEMENT HOOKS
// ========================================

export function useAdmin() {
  const create = useApi(adminApi.create);
  const syncGoogleSheets = useApi(adminApi.syncGoogleSheets);
  const get = useApi(adminApi.get);
  const remove = useApi(adminApi.delete);

  return {
    create,
    syncGoogleSheets,
    get,
    remove,
  };
}

// ========================================
// HEALTH CHECK HOOKS
// ========================================

export function useHealth() {
  const [state, setState] = useState<{
    data: { status: string; timestamp: string; uptime: number; environment: string } | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await healthApi.check();
      setState({
        data,
        loading: false,
        error: null,
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Health check failed';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
} 
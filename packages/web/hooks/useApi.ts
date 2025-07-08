import { useState, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
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
        
        if (response.success && response.data) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
          return response.data;
        } else {
          throw new Error(response.message || 'API request failed');
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

// Specific hooks for common operations
export function useStudents() {
  return useApi(apiClient.getStudents);
}

export function useDocuments() {
  return useApi(apiClient.getDocuments);
}

export function useShifts() {
  return useApi(apiClient.getShifts);
}

export function useClasses() {
  return useApi(apiClient.getClasses);
}

export function useCourses() {
  return useApi(apiClient.getCourses);
}

export function useHospitals() {
  return useApi(apiClient.getHospitals);
}

export function useDashboardStats() {
  return useApi(apiClient.getDashboardStats);
} 
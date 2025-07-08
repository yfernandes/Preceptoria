'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = user.roles.some(role => requiredRoles.includes(role));
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, requiredRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user.roles.some(role => requiredRoles.includes(role));
    if (!hasRequiredRole) {
      return null; // Will redirect to unauthorized
    }
  }

  return <>{children}</>;
} 
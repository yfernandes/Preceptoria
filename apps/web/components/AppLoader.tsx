'use client';

import { useAuth } from '@/contexts/AuthContext';

export function AppLoader({ children }: { children: React.ReactNode }) {
  try {
    const { loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  } catch (error) {
    // If useAuth throws an error (context not available), show loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Inicializando...</p>
        </div>
      </div>
    );
  }
} 
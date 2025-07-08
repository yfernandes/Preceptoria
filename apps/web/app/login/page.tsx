import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Preceptoria</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestão de Estágios
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 
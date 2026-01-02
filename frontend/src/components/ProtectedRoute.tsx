import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  role?: 'admin' | 'librarian' | 'assistant' | 'member';
  element: ReactNode;
}

export default function ProtectedRoute({ role, element }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role) {
    // Assistant has access to librarian routes
    const userEffectiveRole = user.role === 'assistant' ? 'librarian' : user.role;
    
    if (userEffectiveRole !== role) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{element}</>;
}

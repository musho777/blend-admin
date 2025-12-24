import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  console.log('ProtectedRoute: loading =', loading, 'isAuthenticated =', isAuthenticated, 'user =', user);

  useEffect(() => {
    console.log('ProtectedRoute useEffect: loading =', loading, 'isAuthenticated =', isAuthenticated);
    if (!loading && !isAuthenticated) {
      console.log('ProtectedRoute: Redirecting to sign-in');
      router.push('/sign-in');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
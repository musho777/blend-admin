import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/contexts/auth-context';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && window.location.pathname === '/sign-in') {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  return <>{children}</>;
}

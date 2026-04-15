'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './authProvider';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isAuthenticated, loadingAuth } = useAuth();

  useEffect(() => {
    if (loadingAuth) return;

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loadingAuth, router]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}
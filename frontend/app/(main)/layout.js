'use client';

import AuthGuard from '@/app/components/authGuard';
import MainLayout from '@/layout/MainLayout';

export default function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      <MainLayout>
        {children}
      </MainLayout>
    </AuthGuard>
  );
}
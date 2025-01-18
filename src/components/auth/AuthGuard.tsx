import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AuthForm } from './AuthForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isGuest } = useAuthStore();

  if (!user && !isGuest) {
    return <AuthForm />;
  }

  return <>{children}</>;
}
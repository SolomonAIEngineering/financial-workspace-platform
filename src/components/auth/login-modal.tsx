'use client';

import * as React from 'react';

import { LoginForm } from '@/components/auth/login-form';
import { useSession } from '@/components/auth/useSession';
import { DialogContent } from '@/registry/default/potion-ui/dialog';

export function LoginModal() {
  const session = useSession();

  if (session) return null;

  return (
    <DialogContent size="xl">
      <LoginForm />
    </DialogContent>
  );
}

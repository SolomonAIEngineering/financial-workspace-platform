import type { ReactNode } from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  description: 'View and manage your account settings',
  title: 'Account Settings',
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}

'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function skipBankConnection() {
  // Set a cookie to remember that the user skipped this step
  const cookieStore = cookies();
  (await cookieStore).set('onboarding-bank-skipped', 'true', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  revalidatePath('/onboarding');
  return { success: true };
}

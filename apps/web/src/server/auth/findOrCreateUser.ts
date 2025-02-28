import { UserRole } from '@prisma/client';

import WelcomeEmail from '@/components/email/welcome-email';
import { env } from '@/env';
import {
  generateFromUsername,
  generateUsername,
} from '@/lib/generateFromUsername';
import { nid } from '@/lib/nid';
import { sendEmailViaResend } from '@/lib/resend';
import { prisma } from '@/server/db';

export const findOrCreateUser = async ({
  // bio,
  email,
  firstName,
  lastName,
  // location,
  name,
  profileImageUrl,
  providerId,
  providerUserId,
  username,
  // x,
}: {
  email: string;
  providerId: 'github' | 'google';
  providerUserId: string;
  bio?: string;
  firstName?: string;
  github?: string;
  lastName?: string;
  location?: string;
  name?: string;
  profileImageUrl?: string;
  username?: string;
  x?: string;
}) => {
  const existingUser = await prisma.user.findFirst({
    select: {
      id: true,
      oauthAccounts: {
        where: {
          providerId,
          providerUserId,
        },
      },
    },
    where: {
      email,
    },
  });

  // existing user with that email (could be another oauth account)
  if (existingUser) {
    if (existingUser.oauthAccounts.length === 0) {
      // link oauth account
      await prisma.oauthAccount.create({
        data: {
          id: nid(),
          providerId,
          providerUserId,
          userId: existingUser.id,
        },
      });
    }

    return {
      id: existingUser.id,
    };
  }

  const invalidUsername =
    !username || (await prisma.user.count({ where: { username } })) > 0;

  // new user, check for available username
  if (invalidUsername) {
    let usernameIdSize = 3;

    let retry = 10;

    while (retry > 0) {
      retry -= 1;
      usernameIdSize += 1;

      username = generateFromUsername(
        name ?? generateUsername(),
        usernameIdSize
      );

      const existingRandomUsername = await prisma.user.count({
        where: { username },
      });

      if (!existingRandomUsername) {
        break;
      }
    }
  }

  const user = await prisma.user.create({
    data: {
      id: nid(),
      // bio,
      email,
      firstName,
      lastName,
      // location,
      name,
      oauthAccounts: {
        create: {
          id: nid(),
          providerId,
          providerUserId,
        },
      },
      profileImageUrl: profileImageUrl,
      role: env.SUPERADMIN === email ? UserRole.SUPERADMIN : UserRole.USER,
      username: username!,
      // x,
    },
    select: {
      id: true,
    },
  });

  // Send welcome email
  try {
    await sendEmailViaResend({
      email,
      // Set this to prevent Gmail from threading emails
      headers: {
        'X-Entity-Ref-ID': Date.now() + '',
      },
      react: WelcomeEmail({
        email,
        name: firstName || name?.split(' ')[0] || 'there',
      }),
      subject: `Welcome to ${env.NEXT_PUBLIC_APP_NAME}!`,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  await prisma.document.createMany({
    data: [
      {
        id: nid(),
        icon: '🌳',
        templateId: 'playground',
        title: 'Playground',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '🧠',
        templateId: 'ai',
        title: 'AI',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '🤖',
        templateId: 'copilot',
        title: 'Copilot',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '📢',
        templateId: 'callout',
        title: 'Callout',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '🧮',
        templateId: 'equation',
        title: 'Equation',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '📤',
        templateId: 'upload',
        title: 'Upload',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '/',
        templateId: 'slash-menu',
        title: 'Slash Menu',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '📋',
        templateId: 'context-menu',
        title: 'Context Menu',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '🧰',
        templateId: 'floating-toolbar',
        title: 'Floating Toolbar',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '🎮',
        templateId: 'media-toolbar',
        title: 'Media Toolbar',
        userId: user.id,
      },
      {
        id: nid(),
        icon: '📚',
        templateId: 'table-of-contents',
        title: 'Table of Contents',
        userId: user.id,
      },
    ],
  });

  return user;
};

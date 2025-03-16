'use server';

import {
  generateFromUsername,
  generateUsername,
} from '@/lib/generateFromUsername';

import { LoopsClient } from 'loops';
import { UserRole } from '@prisma/client';
import WelcomeEmail from '@/components/email/welcome-email';
import { env } from '@/env';
import { nid } from '@/lib/nid';
import { prisma } from '@/server/db';
import { sendEmailViaResend } from '@/lib/resend';

// Initialize the Loops client with API key from environment variables
const loops = new LoopsClient(process.env.LOOPS_API_KEY || '');
const USER_BASE_MAILING_LIST = process.env.USER_BASE_MAILING_LIST;
const FEATURE_LAUNCH_MAIN_LIST = process.env.FEATURE_LAUNCH_MAIN_LIST;


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

  // Create a contact in Loops
  try {
    const mailingList: Record<string, boolean> = {
      [USER_BASE_MAILING_LIST as string]: true,
      [FEATURE_LAUNCH_MAIN_LIST as string]: true,
    };

    // First, check if the contact already exists in Loops
    const existingContact = await loops.findContact({
      email
    });

    const contactProperties = {
      firstName: firstName || (name ? name.split(' ')[0] : ''),
      lastName: lastName || (name && name.split(' ').length > 1 ? name.split(' ').slice(1).join(' ') : ''),
      userId: user.id, // Store the user ID for future reference
      source: `${providerId} OAuth`,
      userGroup: 'creator',
      createdAt: new Date().toISOString(),
      subscribed: true,
      signupIntent: 'creator',
      organizationCreate: true,
      organizationSlug: username || '',
      organizationCount: 1,
      subscribedAt: new Date().toISOString(),
      ...(providerId === 'github' && {
        githubLogin: true,
      }),
      ...(providerId === 'google' && {
        googleLogin: true,
      }),
    };

    // If contact exists, update it instead of creating a new one
    if (existingContact && existingContact.length > 0) {
      await loops.updateContact(
        email,
        contactProperties,
        mailingList
      );
      console.info(`Successfully updated user in Loops: ${email}`);
    } else {
      // Create contact if it doesn't exist
      await loops.createContact(
        email,
        contactProperties,
        mailingList
      );
      console.info(`Successfully added user to Loops: ${email}`);
    }
  } catch (error) {
    console.error('Failed to create contact in Loops:', error);
    // Don't block the user creation process if Loops integration fails
  }

  // Send welcome email
  try {
    // Only send welcome email in production environment
    if (env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
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
      console.info(`Welcome email sent to ${email} in production environment`);
    } else {
      console.info(`Skipping welcome email to ${email} in ${env.NEXT_PUBLIC_ENVIRONMENT} environment`);
    }
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

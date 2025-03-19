I'll create a comprehensive markdown guide for implementing multi-step onboarding in your application, focusing on the app directory structure and using middleware to check user status. Let me first explore the codebase to understand the structure better.

Ran tool
I see there's already an `onboarding` directory. Let's check if there's any existing middleware:

Ran tool
Let's also check if there's a middleware.ts file at the root level:

Ran tool
Let's check the existing onboarding directory:

Ran tool
It seems the onboarding directory exists but is empty. Let's look at the authentication system to understand how to integrate with it:

Ran tool
Let's look at the main auth file:

Read file: src/lib/auth.ts
Now let's check if there are any server actions related to teams:

Ran tool
Let's try a more specific search:

Ran tool
Let's check if there are any existing server actions:

Ran tool
Let's look for server actions in a more specific way:

Ran tool
Let's check the app layout to understand the structure:

Read file: src/app/layout.tsx
Now I have a good understanding of the codebase structure. Let's create a comprehensive markdown guide for implementing the multi-step onboarding flow.

```markdown:.cursor/snippets/flows/multi-step-onboarding.md

```

Let me create a new file with the markdown guide:

```markdown:docs/multi-step-onboarding-guide.md

```

I'll provide the markdown content directly in my response:

# Multi-Step Onboarding Implementation Guide

This guide outlines how to implement a comprehensive multi-step onboarding flow for authenticated users in the Solomon AI financial management platform. The flow will check if users have completed necessary setup steps (like team creation and profile completion) and guide them through the process.

## Overview

1. Create a middleware to check user onboarding status
2. Implement an onboarding layout with progress tracking
3. Create individual onboarding step components
4. Implement server actions for each onboarding step
5. Add navigation and state management

## 1. Creating the Middleware

First, we'll create a middleware that runs at the edge to check if a user has completed onboarding.

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from '@/lib/auth';

// Define paths that should bypass onboarding checks
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/onboarding',
];

// Define onboarding steps in order
const ONBOARDING_STEPS = [
  '/onboarding/team',
  '/onboarding/profile',
  '/onboarding/bank-connection',
  '/onboarding/complete',
];

export async function middleware(request: NextRequest) {
  // Skip middleware for public paths
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get authentication state
  const { user, session } = await getAuth();

  // If not authenticated, allow the auth system to handle redirection
  if (!user || !session) {
    return NextResponse.next();
  }

  // Check if user has a team
  // If not, redirect to team creation step
  const hasTeam = user.teamId !== null;

  if (!hasTeam && !pathname.startsWith('/onboarding/team')) {
    return NextResponse.redirect(new URL('/onboarding/team', request.url));
  }

  // If user has a team but is in team creation step, move to next step
  if (hasTeam && pathname === '/onboarding/team') {
    return NextResponse.redirect(new URL('/onboarding/profile', request.url));
  }

  // Check if user has completed profile
  const hasProfile = Boolean(user.name && user.email && user.profileImageUrl);

  if (hasTeam && !hasProfile && !pathname.startsWith('/onboarding/profile')) {
    return NextResponse.redirect(new URL('/onboarding/profile', request.url));
  }

  // If user has profile but is in profile step, move to next step
  if (hasTeam && hasProfile && pathname === '/onboarding/profile') {
    return NextResponse.redirect(
      new URL('/onboarding/bank-connection', request.url)
    );
  }

  // Check if user has connected a bank account
  const hasBankConnection =
    user.bankConnections && user.bankConnections.length > 0;

  if (
    hasTeam &&
    hasProfile &&
    !hasBankConnection &&
    !pathname.startsWith('/onboarding/bank-connection')
  ) {
    return NextResponse.redirect(
      new URL('/onboarding/bank-connection', request.url)
    );
  }

  // If all steps are complete and user is still in onboarding, redirect to dashboard
  if (
    hasTeam &&
    hasProfile &&
    hasBankConnection &&
    pathname.startsWith('/onboarding')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## 2. Onboarding Layout

Create a layout for the onboarding flow that includes progress tracking:

```typescript
// src/app/onboarding/layout.tsx
import { ReactNode } from 'react';
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress';
import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default async function OnboardingLayout({ children }: OnboardingLayoutProps) {
  // Get authentication state
  const { user } = await getAuth();

  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login');
  }

  // Calculate current step based on user data
  let currentStep = 1;

  if (user.teamId) {
    currentStep = 2;
  }

  if (user.teamId && user.name && user.email && user.profileImageUrl) {
    currentStep = 3;
  }

  if (user.teamId && user.name && user.email && user.profileImageUrl &&
      user.bankConnections && user.bankConnections.length > 0) {
    currentStep = 4;
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <div className="container max-w-6xl py-6 md:py-10">
        <div className="mx-auto flex w-full flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Complete Your Setup
            </h1>
            <p className="text-muted-foreground">
              Let's get your account set up so you can start managing your finances.
            </p>
          </div>

          <OnboardingProgress currentStep={currentStep} />

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 3. Onboarding Progress Component

Create a progress indicator component:

```typescript
// src/components/onboarding/onboarding-progress.tsx
import { CheckIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Create Team' },
  { id: 2, name: 'Complete Profile' },
  { id: 3, name: 'Connect Bank' },
  { id: 4, name: 'Complete' },
];

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step) => (
          <li key={step.name} className="md:flex-1">
            <div
              className={cn(
                "flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                step.id < currentStep
                  ? "border-primary"
                  : step.id === currentStep
                  ? "border-primary"
                  : "border-border"
              )}
            >
              <span className="text-sm font-medium">
                Step {step.id}
              </span>
              <span className="flex items-center gap-2 text-sm font-medium">
                {step.id < currentStep ? (
                  <CheckIcon className="h-4 w-4 text-primary" />
                ) : null}
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

## 4. Onboarding Step Pages

### 4.1 Team Creation Step

```typescript
// src/app/onboarding/team/page.tsx
import { TeamCreationForm } from '@/components/onboarding/team-creation-form';
import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TeamCreationPage() {
  const { user } = await getAuth();

  // If user already has a team, redirect to next step
  if (user?.teamId) {
    redirect('/onboarding/profile');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Create Your Team</h2>
        <p className="text-muted-foreground">
          Set up your organization to start managing your finances.
        </p>
      </div>

      <TeamCreationForm userId={user?.id} />
    </div>
  );
}
```

### 4.2 Team Creation Form Component

```typescript
// src/components/onboarding/team-creation-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createTeam } from '@/actions/team';

const teamFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Team name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  baseCurrency: z.string().default('USD'),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface TeamCreationFormProps {
  userId: string;
}

export function TeamCreationForm({ userId }: TeamCreationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: '',
      email: '',
      baseCurrency: 'USD',
    },
  });

  async function onSubmit(data: TeamFormValues) {
    setIsSubmitting(true);

    try {
      await createTeam({
        name: data.name,
        email: data.email,
        baseCurrency: data.baseCurrency,
        userId,
      });

      // Refresh the page to trigger middleware redirect
      router.refresh();
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Email</FormLabel>
              <FormControl>
                <Input placeholder="team@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Team'}
        </Button>
      </form>
    </Form>
  );
}
```

### 4.3 Profile Completion Step

```typescript
// src/app/onboarding/profile/page.tsx
import { ProfileForm } from '@/components/onboarding/profile-form';
import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const { user } = await getAuth();

  // If user doesn't have a team yet, redirect to team creation
  if (!user?.teamId) {
    redirect('/onboarding/team');
  }

  // If user already has a complete profile, redirect to next step
  if (user?.name && user?.email && user?.profileImageUrl) {
    redirect('/onboarding/bank-connection');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself to personalize your experience.
        </p>
      </div>

      <ProfileForm
        userId={user?.id}
        initialData={{
          name: user?.name || '',
          email: user?.email || '',
          profileImageUrl: user?.profileImageUrl || '',
        }}
      />
    </div>
  );
}
```

### 4.4 Bank Connection Step

```typescript
// src/app/onboarding/bank-connection/page.tsx
import { BankConnectionForm } from '@/components/onboarding/bank-connection-form';
import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function BankConnectionPage() {
  const { user } = await getAuth();

  // If user doesn't have a team or profile, redirect to appropriate step
  if (!user?.teamId) {
    redirect('/onboarding/team');
  }

  if (!(user?.name && user?.email && user?.profileImageUrl)) {
    redirect('/onboarding/profile');
  }

  // If user already has bank connections, redirect to completion
  if (user?.bankConnections && user.bankConnections.length > 0) {
    redirect('/onboarding/complete');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Connect Your Bank</h2>
        <p className="text-muted-foreground">
          Connect your bank accounts to start tracking your finances.
        </p>
      </div>

      <BankConnectionForm userId={user?.id} teamId={user?.teamId} />
    </div>
  );
}
```

### 4.5 Completion Step

```typescript
// src/app/onboarding/complete/page.tsx
import { Button } from '@/components/ui/button';
import { getAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default async function CompletePage() {
  const { user } = await getAuth();

  // Check if all onboarding steps are complete
  const hasTeam = Boolean(user?.teamId);
  const hasProfile = Boolean(user?.name && user?.email && user?.profileImageUrl);
  const hasBankConnection = Boolean(user?.bankConnections && user.bankConnections.length > 0);

  // If any step is incomplete, redirect to the appropriate step
  if (!hasTeam) {
    redirect('/onboarding/team');
  }

  if (!hasProfile) {
    redirect('/onboarding/profile');
  }

  if (!hasBankConnection) {
    redirect('/onboarding/bank-connection');
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <CheckCircle className="h-16 w-16 text-primary" />

      <div>
        <h2 className="text-2xl font-bold">Setup Complete!</h2>
        <p className="text-muted-foreground">
          You're all set to start managing your finances with Solomon AI.
        </p>
      </div>

      <Button asChild size="lg">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
```

## 5. Server Actions

Create server actions for each onboarding step:

### 5.1 Team Creation Action

```typescript
// src/actions/team.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { z } from 'zod';

const teamSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  baseCurrency: z.string().default('USD'),
  userId: z.string(),
});

export async function createTeam(data: z.infer<typeof teamSchema>) {
  const validated = teamSchema.parse(data);

  try {
    // Create a new team
    const team = await prisma.team.create({
      data: {
        name: validated.name,
        email: validated.email,
        baseCurrency: validated.baseCurrency,
      },
    });

    // Create the user-team relationship
    await prisma.usersOnTeam.create({
      data: {
        userId: validated.userId,
        teamId: team.id,
        role: 'OWNER',
      },
    });

    // Update the user with the team ID
    await prisma.user.update({
      where: { id: validated.userId },
      data: { teamId: team.id },
    });

    revalidatePath('/onboarding');
    return { success: true, team };
  } catch (error) {
    console.error('Failed to create team:', error);
    return { success: false, error: 'Failed to create team' };
  }
}
```

### 5.2 Profile Update Action

```typescript
// src/actions/profile.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { z } from 'zod';

const profileSchema = z.object({
  userId: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  profileImageUrl: z.string().url().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const validated = profileSchema.parse(data);

  try {
    // Update user profile
    const user = await prisma.user.update({
      where: { id: validated.userId },
      data: {
        name: validated.name,
        email: validated.email,
        profileImageUrl: validated.profileImageUrl,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phoneNumber: validated.phoneNumber,
      },
    });

    revalidatePath('/onboarding');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
```

### 5.3 Bank Connection Action

```typescript
// src/actions/bank-connection.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { z } from 'zod';

const bankConnectionSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  institutionId: z.string(),
  institutionName: z.string(),
  accessToken: z.string(),
  itemId: z.string(),
  provider: z.string().default('plaid'),
});

export async function createBankConnection(
  data: z.infer<typeof bankConnectionSchema>
) {
  const validated = bankConnectionSchema.parse(data);

  try {
    // Create bank connection
    const connection = await prisma.bankConnection.create({
      data: {
        userId: validated.userId,
        institutionId: validated.institutionId,
        institutionName: validated.institutionName,
        accessToken: validated.accessToken, // Note: In production, encrypt this token
        itemId: validated.itemId,
        status: 'ACTIVE',
        provider: validated.provider,
      },
    });

    // Add connection to team
    await prisma.team.update({
      where: { id: validated.teamId },
      data: {
        bankConnections: {
          connect: { id: connection.id },
        },
      },
    });

    revalidatePath('/onboarding');
    return { success: true, connection };
  } catch (error) {
    console.error('Failed to create bank connection:', error);
    return { success: false, error: 'Failed to create bank connection' };
  }
}
```

## 6. Profile Form Component

```typescript
// src/components/onboarding/profile-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateProfile } from '@/actions/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  profileImageUrl: z.string().url().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  userId: string;
  initialData: {
    name: string;
    email: string;
    profileImageUrl?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      profileImageUrl: initialData.profileImageUrl || '',
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      phoneNumber: initialData.phoneNumber || '',
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);

    try {
      await updateProfile({
        userId,
        ...data,
      });

      // Refresh the page to trigger middleware redirect
      router.refresh();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={form.watch('profileImageUrl')} />
            <AvatarFallback>
              {form.watch('name')?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <FormField
            control={form.control}
            name="profileImageUrl"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Profile Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/avatar.jpg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Form>
  );
}
```

## 7. Bank Connection Form Component

````typescript
// src/components/onboarding/bank-connection-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createBankConnection } from '@/actions/bank-connection';
import { Bank, CreditCard, DollarSign } from 'lucide-react';

// Note: This is a simplified version. In a real implementation,
// you would integrate with Plaid or another banking API

interface BankConnectionFormProps {
  userId: string;
  teamId: string;
}

export function BankConnectionForm({ userId, teamId }: BankConnectionFormProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock function to simulate bank connection
  // In a real implementation, this would open Plaid Link or similar
  async function connectBank(bankType: string) {
    setIsConnecting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock data - in a real implementation, this would come from Plaid
      const mockData = {
        institutionId: `inst_${Math.random().toString(36).substring(2, 9)}`,
        institutionName: bankType === 'bank' ? 'Demo Bank' : 'Demo Credit Card',
        accessToken: `access-sandbox-${Math.random().toString(36).substring(2, 9)}`,
        itemId: `item-sandbox-${Math.random().toString(36).substring(2, 9)}`,
      };

      // Create bank connection
      await createBankConnection({
        userId,
        teamId,
        ...mockData,
        provider: 'plaid',
      });

      // Refresh the page to trigger middleware redirect
      router.refresh();
    } catch (error) {
      console.error('Failed to connect bank:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="cursor-pointer hover:bg-muted/50" onClick={() => connectBank('bank')}>
        <CardHeader>
          <Bank className="h-8 w-8 text-primary" />
          <CardTitle className="mt-4">Connect Bank Account</CardTitle>
          <CardDescription>
            Connect your checking or savings accounts to track balances and transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled={isConnecting} className="w-full">
            {isConnecting ? 'Connecting...' : 'Connect Bank'}
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:bg-muted/50" onClick={() => connectBank('credit')}>
        <CardHeader>
          <CreditCard className="h-8 w-8 text-primary" />
          <CardTitle className="mt-4">Connect Credit Card</CardTitle>
          <CardDescription>
            Connect your credit cards to track spending and manage payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled={isConnecting} className="w-full">
            {isConnecting ? 'Connecting...' : 'Connect Card'}
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <DollarSign className="h-8 w-8 text-muted-foreground" />
          <CardTitle className="mt-4">Skip for Now</CardTitle>
          <CardDescription>
            You can connect your accounts later from the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/onboarding/complete')}
          >
            Skip This
I'll continue with the rest of the multi-step onboarding implementation guide.

## 7. Bank Connection Form Component (continued)

```typescript
// src/components/onboarding/bank-connection-form.tsx (continued)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
````

## 8. Checking Onboarding Status in Components

You may want to check onboarding status in various components. Here's a utility function to help with that:

```typescript
// src/lib/onboarding.ts
import { getAuth } from '@/lib/auth';

export interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  hasTeam: boolean;
  hasProfile: boolean;
  hasBankConnection: boolean;
  nextStep: string;
}

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const { user } = await getAuth();

  if (!user) {
    return {
      isComplete: false,
      currentStep: 0,
      hasTeam: false,
      hasProfile: false,
      hasBankConnection: false,
      nextStep: '/login',
    };
  }

  const hasTeam = Boolean(user.teamId);
  const hasProfile = Boolean(user.name && user.email && user.profileImageUrl);
  const hasBankConnection = Boolean(
    user.bankConnections && user.bankConnections.length > 0
  );

  let currentStep = 1;
  let nextStep = '/onboarding/team';

  if (hasTeam) {
    currentStep = 2;
    nextStep = '/onboarding/profile';
  }

  if (hasTeam && hasProfile) {
    currentStep = 3;
    nextStep = '/onboarding/bank-connection';
  }

  if (hasTeam && hasProfile && hasBankConnection) {
    currentStep = 4;
    nextStep = '/onboarding/complete';
  }

  const isComplete = hasTeam && hasProfile && hasBankConnection;

  return {
    isComplete,
    currentStep,
    hasTeam,
    hasProfile,
    hasBankConnection,
    nextStep,
  };
}
```

## 9. Onboarding Banner Component

Create a component to show onboarding status in the dashboard:

```typescript
// src/components/onboarding/onboarding-banner.tsx
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { getOnboardingStatus } from '@/lib/onboarding';

export async function OnboardingBanner() {
  const { isComplete, currentStep, nextStep } = await getOnboardingStatus();

  if (isComplete) {
    return null;
  }

  const progress = (currentStep / 4) * 100;

  return (
    <Alert className="mb-6">
      <AlertTitle className="flex items-center justify-between">
        <span>Complete your account setup</span>
        <Progress value={progress} className="h-2 w-24" />
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You have {4 - currentStep} steps remaining to complete your account setup.
        </span>
        <Button asChild size="sm">
          <Link href={nextStep}>Continue Setup</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
```

## 10. Integrating with Dashboard

Add the onboarding banner to your dashboard:

```typescript
// src/app/dashboard/layout.tsx
import { OnboardingBanner } from '@/components/onboarding/onboarding-banner';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { requireAuth } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Ensure user is authenticated
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <DashboardNav />
        <main className="flex w-full flex-col overflow-hidden">
          <OnboardingBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
```

## 11. Handling Edge Cases

### 11.1 Skip Bank Connection Option

For users who want to skip the bank connection step:

```typescript
// src/actions/skip-bank-connection.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function skipBankConnection() {
  // Set a cookie to remember that the user skipped this step
  cookies().set('onboarding-bank-skipped', 'true', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  revalidatePath('/onboarding');
  return { success: true };
}
```

Update the middleware to handle this case:

```typescript
// src/middleware.ts (update)
// Add this to the middleware function

// Check if user has skipped bank connection
const hasBankSkipped =
  request.cookies.get('onboarding-bank-skipped')?.value === 'true';

// Modify the bank connection check
if (
  hasTeam &&
  hasProfile &&
  !hasBankConnection &&
  !hasBankSkipped &&
  !pathname.startsWith('/onboarding/bank-connection')
) {
  return NextResponse.redirect(
    new URL('/onboarding/bank-connection', request.url)
  );
}

// If user skipped bank connection, treat as complete for onboarding purposes
if (
  hasTeam &&
  hasProfile &&
  (hasBankConnection || hasBankSkipped) &&
  pathname.startsWith('/onboarding')
) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

### 11.2 Resuming Onboarding

Add a component to allow users to resume onboarding:

```typescript
// src/components/onboarding/resume-onboarding.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ResumeOnboardingProps {
  nextStep: string;
}

export function ResumeOnboarding({ nextStep }: ResumeOnboardingProps) {
  const router = useRouter();

  return (
    <Button onClick={() => router.push(nextStep)}>
      Resume Onboarding
    </Button>
  );
}
```

## 12. Database Schema Considerations

Based on the Prisma schema provided, here are some key models and fields relevant to the onboarding process:

### 12.1 User Model

The `User` model contains fields needed for profile completion:

- `name`, `firstName`, `lastName` - User's name information
- `email` - User's email address
- `profileImageUrl` - User's profile image
- `teamId` - Reference to the user's team

### 12.2 Team Model

The `Team` model represents an organization:

- `name` - Team name
- `email` - Team email
- `baseCurrency` - Default currency for the team
- `logoUrl` - Team logo

### 12.3 UsersOnTeam Model

This join table manages the relationship between users and teams:

- `userId` - Reference to the user
- `teamId` - Reference to the team
- `role` - User's role in the team (OWNER, MEMBER)

### 12.4 BankConnection Model

Represents a connection to a financial institution:

- `userId` - Reference to the user
- `institutionId` - ID of the financial institution
- `institutionName` - Name of the financial institution
- `accessToken` - Token for API access (should be encrypted)
- `itemId` - Unique identifier for the connection
- `status` - Connection status (ACTIVE, ERROR, etc.)

## 13. Testing the Onboarding Flow

### 13.1 Manual Testing Checklist

1. **Authentication**

   - Register a new user
   - Verify redirect to onboarding flow

2. **Team Creation**

   - Fill out team form
   - Submit and verify redirect to profile step

3. **Profile Completion**

   - Fill out profile form
   - Submit and verify redirect to bank connection step

4. **Bank Connection**

   - Test connecting a bank
   - Test skipping bank connection
   - Verify redirect to completion step

5. **Completion**
   - Verify redirect to dashboard
   - Check onboarding banner visibility

### 13.2 Automated Testing

Create end-to-end tests for the onboarding flow:

```typescript
// src/tests/onboarding.test.ts
import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test('should complete full onboarding flow', async ({ page }) => {
    // Register a new user
    await page.goto('/register');
    // Fill registration form and submit

    // Team Creation
    await expect(page).toHaveURL('/onboarding/team');
    await page.fill('input[name="name"]', 'Test Team');
    await page.fill('input[name="email"]', 'team@example.com');
    await page.click('button[type="submit"]');

    // Profile Completion
    await expect(page).toHaveURL('/onboarding/profile');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill(
      'input[name="profileImageUrl"]',
      'https://example.com/avatar.jpg'
    );
    await page.click('button[type="submit"]');

    // Bank Connection
    await expect(page).toHaveURL('/onboarding/bank-connection');
    // Test skipping for simplicity
    await page.click('text=Skip This');

    // Completion
    await expect(page).toHaveURL('/onboarding/complete');
    await page.click('text=Go to Dashboard');

    // Dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## 14. Security Considerations

### 14.1 Protecting Sensitive Data

When handling financial data, ensure:

1. **Encryption** - Encrypt sensitive data like access tokens
2. **HTTPS** - Use HTTPS for all communications
3. **Input Validation** - Validate all user inputs with Zod schemas
4. **Rate Limiting** - Implement rate limiting for API endpoints
5. **Audit Logging** - Log all sensitive operations

### 14.2 Middleware Security

Ensure the middleware is secure:

1. **Authentication Checks** - Verify user is authenticated
2. **CSRF Protection** - Implement CSRF protection for forms
3. **XSS Prevention** - Sanitize user inputs to prevent XSS
4. **Secure Cookies** - Use secure, HTTP-only cookies

## 15. Performance Optimization

### 15.1 Edge Middleware Optimization

Since middleware runs at the edge:

1. **Minimize Database Queries** - Cache user data when possible
2. **Lightweight Checks** - Keep middleware logic simple
3. **Use Cookies** - Store simple flags in cookies instead of database queries
4. **Avoid Heavy Computation** - Move complex logic to server actions

### 15.2 Server Actions Optimization

For server actions:

1. **Batch Database Operations** - Use transactions for multiple operations
2. **Revalidate Selectively** - Only revalidate necessary paths
3. **Error Handling** - Implement robust error handling
4. **Caching** - Use React Cache for expensive operations

## Conclusion

This implementation provides a comprehensive multi-step onboarding flow that guides users through team creation, profile completion, and bank connection. The middleware ensures users complete each step before accessing protected areas of the application.

The solution leverages Next.js App Router, server actions, and middleware to create a seamless experience while maintaining security and performance. By following the schema-based approach with Prisma, the implementation is type-safe and integrates well with the existing codebase.

Remember to adapt this implementation to your specific requirements and existing components, especially for bank connection integration which would typically use a service like Plaid.

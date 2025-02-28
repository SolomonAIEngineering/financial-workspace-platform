'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/registry/default/potion-ui/button';
import { Input } from '@/registry/default/potion-ui/input';

import { useLogoutMutation } from '../auth/useLogoutMutation';
import { Icons } from '../ui/icons';

const passwordSchema = z
  .object({
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecuritySection() {
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const logout = useLogoutMutation();

  const [sessions] = useState([
    {
      id: '1',
      current: true,
      device: 'Chrome on macOS',
      lastActive: 'Just now',
      location: 'San Francisco, CA',
    },
    {
      id: '2',
      current: false,
      device: 'Firefox on Windows',
      lastActive: '2 days ago',
      location: 'Seattle, WA',
    },
    {
      id: '3',
      current: false,
      device: 'Safari on iPhone',
      lastActive: '1 week ago',
      location: 'New York, NY',
    },
  ]);

  const form = useForm<PasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
    },
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit() {
    setIsLoadingPassword(true);

    try {
      // This is just a simulation since we're using OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      form.reset();
    } catch {
      toast.error('Failed to update password');
    } finally {
      setIsLoadingPassword(false);
    }
  }

  const handleRevokeSession = (sessionId: string) => {
    toast.success('Session revoked successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                name="currentPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="newPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button disabled={isLoadingPassword} type="submit">
                {isLoadingPassword && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across different devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {session.device.includes('Chrome') && (
                        <Icons.chrome className="size-5" />
                      )}
                      {session.device.includes('Firefox') && (
                        <Icons.firefox className="size-5" />
                      )}
                      {session.device.includes('Safari') && (
                        <Icons.safari className="size-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{session.device}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {session.location}
                        </p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {session.lastActive}
                        </p>
                      </div>
                      {session.current && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Current Session
                        </span>
                      )}
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              logout.mutate();
              toast.success('Logged out of all devices');
            }}
          >
            {logout.isPending ? (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            ) : (
              <Icons.logOut className="mr-2 size-4" />
            )}
            Sign out of all devices
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

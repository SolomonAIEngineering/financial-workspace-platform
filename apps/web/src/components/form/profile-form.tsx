'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '@/registry/default/potion-ui/button';
import { Input } from '@/registry/default/potion-ui/input';
import { api } from '@/trpc/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const [error, setError] = useState<string | null>(null);

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

  // Define the tRPC mutations
  const updateSettingsMutation = api.user.updateSettings.useMutation({
    onError: (err) => {
      console.error('Failed to update settings:', err);
      setError(err.message || 'Failed to update profile settings');
    },
  });

  const updateContactInfoMutation = api.user.updateContactInfo.useMutation({
    onError: (err) => {
      console.error('Failed to update contact info:', err);
      setError(err.message || 'Failed to update contact information');
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setError(null);

    try {
      // Update the main user settings
      await updateSettingsMutation.mutateAsync({
        bio: undefined, // Not included in the form
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name,
        profileImageUrl: data.profileImageUrl,
      });

      // Update phone number if provided
      if (data.phoneNumber) {
        await updateContactInfoMutation.mutateAsync({
          phoneNumber: data.phoneNumber,
        });
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (err) {
      // Error handling already done in mutation callbacks
    }
  }

  const isSubmitting = updateSettingsMutation.isPending || updateContactInfoMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 text-sm font-medium text-white bg-red-500 rounded-md">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={form.watch('profileImageUrl') || ''}
              alt={form.watch('name') || ''}
            />
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
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    {...field}
                  />
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

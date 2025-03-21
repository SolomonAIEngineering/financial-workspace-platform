/**
 * Tab content for basic profile information
 *
 * @file Basic Profile Tab Component
 */

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import { Button } from '@/registry/default/potion-ui/button';
import { TabsContent } from '@/registry/default/potion-ui/tabs';
import { Textarea } from '@/registry/default/potion-ui/textarea';

import {
  type TabComponentProps,
  PROFILE_CONSTANTS,
} from '../../types/profile-types';
import { getUserInitials } from '../../utils/profile-utils';
import { ProfileFormField } from '../profile-form-field';

/**
 * Basic profile tab component that displays and allows editing of name, email,
 * bio, etc.
 *
 * @example
 *   <BasicProfileTab
 *     form={form}
 *     isLoading={isLoading}
 *     onSubmit={handleSubmit}
 *   />;
 *
 * @param props - Component props including form, loading state, and submit
 *   handler
 * @returns A tab content component for basic profile information
 */
export function BasicProfileTab({
  form,
  isLoading,
  onSubmit,
}: TabComponentProps) {
  // Get user initials for avatar fallback
  const firstName = form.watch('firstName');
  const lastName = form.watch('lastName');
  const displayName = form.watch('name');
  const avatarInitials = getUserInitials(firstName, lastName, displayName);

  return (
    <TabsContent
      className="slide-in-from-right-2 mt-6 animate-in space-y-8 duration-300"
      value="basic"
    >
      {/* Avatar display section */}
      <div className="flex flex-col items-center gap-6 rounded-xl border border-muted/10 bg-gradient-to-br from-background via-background to-muted/10 p-6 shadow-sm sm:flex-row">
        <Avatar className="size-28 border-4 border-primary/10 shadow-md">
          <AvatarImage
            className="object-cover"
            alt="Profile"
            src={form.watch('profileImageUrl') || ''}
          />
          <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/50 text-2xl font-medium text-white">
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-3 text-center sm:text-left">
          <h3 className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-medium text-transparent">
            Profile Picture
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Your profile picture will be visible to other users across the
            application. Use a square image with your face clearly visible for
            best results.
          </p>
        </div>
      </div>

      {/* First name and last name fields */}
      <div className="grid gap-8 sm:grid-cols-2">
        <ProfileFormField
          name="firstName"
          label="First Name"
          placeholder="Enter your first name"
          control={form.control}
          icon={<Icons.user className="size-4 text-primary/60" />}
          tooltipDescription="Your legal first name as it appears on official documents"
        />

        <ProfileFormField
          name="lastName"
          label="Last Name"
          placeholder="Enter your last name"
          control={form.control}
          icon={<Icons.user className="size-4 text-primary/60" />}
          tooltipDescription="Your legal last name as it appears on official documents"
        />
      </div>

      {/* Display name field */}
      <ProfileFormField
        name="name"
        description="This is your public display name seen by others."
        tooltipDescription="Your display name will be shown in chat messages, comments, and team collaborations. It can be different from your legal name."
        label="Display Name"
        placeholder="Enter your full name"
        control={form.control}
        icon={<Icons.user className="size-4 text-primary/60" />}
      />

      {/* Email field */}
      <ProfileFormField
        name="email"
        description="Your email address is used for notifications and account recovery."
        tooltipDescription="This email is used for account notifications and security alerts. Changing it may require reverification."
        label="Email"
        placeholder="Enter your email"
        control={form.control}
        icon={<Icons.message className="size-4 text-primary/60" />}
      />

      {/* Enhanced Bio Field with character counter */}
      <FormField
        name="bio"
        control={form.control}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="flex items-center gap-2 text-sm font-medium">
              <Icons.text className="size-4 text-primary/60" />
              Bio
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Textarea
                  className="text-md min-h-[150px] w-full resize-none rounded-lg border border-muted/20 bg-gradient-to-r from-primary/5 to-background p-4 leading-relaxed shadow-sm focus:border-primary/30 focus:ring-primary/20"
                  placeholder="Tell us about yourself..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <div className="absolute right-3 bottom-3 rounded-full bg-background/80 px-2 py-1 text-xs text-muted-foreground">
                {field.value?.length || 0}/{PROFILE_CONSTANTS.MAX_TEXT_LENGTH}
              </div>
            </div>
            <FormDescription className="text-xs">
              Write a short professional bio about yourself. This will be
              visible on your public profile.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Profile image URL field */}
      <ProfileFormField
        name="profileImageUrl"
        description="URL to your profile picture. Use a square image for best results."
        tooltipDescription="Your profile picture will be displayed in comments, mentions, and your profile page. We recommend using a clear headshot with your face visible."
        label="Profile Picture URL"
        placeholder="https://example.com/your-avatar.jpg"
        control={form.control}
        icon={<Icons.image className="size-4 text-primary/60" />}
      />

      {/* Tab-specific save button */}
      <div className="mt-4 flex justify-end">
        <Button
          className="rounded-full border border-primary bg-background px-6 py-2 text-primary shadow-sm transition-all duration-300 hover:shadow"
          disabled={isLoading || !form.formState.isDirty}
          onClick={() => onSubmit(form.getValues())}
          type="button"
        >
          {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
          Save Basic Info
        </Button>
      </div>
    </TabsContent>
  );
}

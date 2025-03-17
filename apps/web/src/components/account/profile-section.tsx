/**
 * Main component for editing user profile information
 *
 * @file Profile Section Component
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@udecode/cn';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Button } from '@/registry/default/potion-ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/registry/default/potion-ui/tabs';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { BasicProfileTab } from './components/tabs/basic-profile-tab';
import { ContactProfileTab } from './components/tabs/contact-profile-tab';
import { OrganizationProfileTab } from './components/tabs/organization-profile-tab';
import { ProfessionalProfileTab } from './components/tabs/professional-profile-tab';
import { SocialProfileTab } from './components/tabs/social-profile-tab';
import { useProfileMutations } from './hooks/use-profile-mutations';
import {
  type ProfileSectionProps,
  profileFormSchema,
} from './types/profile-types';
import { filterEmptyValues, getTabData } from './utils/profile-utils';

/**
 * Profile Section component handles the display and editing of all user profile
 * information
 *
 * @example
 *   <ProfileSection user={userData} userSettings={settingsData} />;
 *
 * @param props - Component props including user data and settings
 * @returns A component that allows users to edit their profile information
 */
export function ProfileSection({ user, userSettings }: ProfileSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize profile mutations for API calls
  const profileMutations = useProfileMutations();

  // Initialize the form with user data
  const form = useForm({
    defaultValues: {
      // Address fields
      addressLine1: user?.addressLine1 || '',
      addressLine2: user?.addressLine2 || '',
      bio: user?.bio || '',
      businessEmail: user?.businessEmail || '',
      businessPhone: user?.businessPhone || '',
      city: user?.city || '',

      country: user?.country || '',
      department: user?.department || '',

      email: userSettings?.email || user?.email || '',
      firstName: user?.firstName || '',
      githubProfile: user?.githubProfile || '',

      // Professional details
      jobTitle: user?.jobTitle || '',
      language: user?.language || '',
      lastName: user?.lastName || '',
      // Social profiles
      linkedinProfile: user?.linkedinProfile || '',

      // Basic profile
      name: userSettings?.name || user?.name || '',
      officeLocation: user?.officeLocation || '',
      // Organization data
      organizationName: user?.organizationName || '',
      organizationUnit: user?.organizationUnit || '',
      // Contact information
      phoneNumber: user?.phoneNumber || '',
      postalCode: user?.postalCode || '',

      profileImageUrl:
        userSettings?.profileImageUrl || user?.profileImageUrl || '',
      state: user?.state || '',
      teamName: user?.teamName || '',

      // Preferences
      timezone: user?.timezone || '',
      twitterProfile: user?.twitterProfile || '',
    },
    resolver: zodResolver(profileFormSchema),
  });

  /**
   * Submit handler for form data
   *
   * @param data - Form data to submit
   */
  async function onSubmit(data: any) {
    setIsLoading(true);

    try {
      // Get the appropriate mutation for the current tab
      const tabData = getTabData(activeTab, data);

      // Apply tab-specific mutations
      switch (activeTab) {
        case 'basic': {
          // Don't filter out the bio field for basic profile
          const filteredData = {
            ...filterEmptyValues(tabData),
            // Ensure bio is explicitly included even if empty
            bio: data.bio || '',
          };
          await profileMutations.updateProfileMutation.mutateAsync(
            filteredData
          );

          break;
        }
        case 'contact': {
          await profileMutations.updateContactInfoMutation.mutateAsync(tabData);

          break;
        }
        case 'organization': {
          await profileMutations.updateOrganizationInfoMutation.mutateAsync(
            tabData
          );

          break;
        }
        case 'professional': {
          await profileMutations.updateProfessionalProfileMutation.mutateAsync(
            tabData
          );

          break;
        }
        case 'social': {
          await profileMutations.updateSocialProfilesMutation.mutateAsync(
            tabData
          );

          break;
        }
      }
    } catch (error) {
      console.error(`Error updating ${activeTab} profile:`, error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl border-0 bg-background shadow-md">
      <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-primary/5 via-primary/3 to-muted/5 pb-6">
        <div className="flex items-center gap-2">
          <Icons.user className="size-5 text-primary" />
          <CardTitle>Profile Information</CardTitle>
          <InfoTooltip
            description="Your profile information is visible to other team members and may be displayed in shared reports and documents."
            size="sm"
          />
        </div>
        <CardDescription className="text-muted-foreground/90">
          Update your profile information visible to other users.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form
          className="fade-in animate-in duration-500"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="px-8 pt-6">
            <Tabs
              className="w-full"
              defaultValue="basic"
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-8 grid h-auto w-full grid-cols-3 rounded-2xl border border-muted/10 bg-background p-1.5 text-foreground shadow-sm md:grid-cols-5">
                <TabsTrigger
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  value="basic"
                >
                  <Icons.user className="size-4 opacity-80" />
                  <span className="hidden md:inline">Basic</span>
                  <InfoTooltip
                    title="Basic Profile"
                    description="Your name, profile image, bio, and language preferences"
                    size="sm"
                    side="bottom"
                  />
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  value="professional"
                >
                  <Icons.file className="size-4 opacity-80" />
                  <span className="hidden md:inline">Professional</span>
                  <InfoTooltip
                    title="Professional Details"
                    description="Your job title, department, skills, and professional experience"
                    size="sm"
                    side="bottom"
                  />
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  value="organization"
                >
                  <Icons.settings className="size-4 opacity-80" />
                  <span className="hidden md:inline">Organization</span>
                  <InfoTooltip
                    title="Organization Info"
                    description="Your organization name, team, manager, and reporting relationships"
                    size="sm"
                    side="bottom"
                  />
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  value="contact"
                >
                  <Icons.message className="size-4 opacity-80" />
                  <span className="hidden md:inline">Contact</span>
                  <InfoTooltip
                    title="Contact Information"
                    description="Your phone numbers, email addresses, and physical address details"
                    size="sm"
                    side="bottom"
                  />
                </TabsTrigger>
                <TabsTrigger
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 hover:bg-muted/20 data-[state=active]:scale-[1.02] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                  value="social"
                >
                  <Icons.link className="size-4 opacity-80" />
                  <span className="hidden md:inline">Social</span>
                  <InfoTooltip
                    title="Social Profiles"
                    description="Your LinkedIn, Twitter, and GitHub profile links"
                    size="sm"
                    side="bottom"
                  />
                </TabsTrigger>
              </TabsList>

              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-30" />

                {/* Individual tab content components */}
                <BasicProfileTab
                  onSubmit={onSubmit}
                  form={form}
                  isLoading={isLoading}
                />
                <ProfessionalProfileTab
                  onSubmit={onSubmit}
                  form={form}
                  isLoading={isLoading}
                />
                <OrganizationProfileTab
                  onSubmit={onSubmit}
                  form={form}
                  isLoading={isLoading}
                />
                <ContactProfileTab
                  onSubmit={onSubmit}
                  form={form}
                  isLoading={isLoading}
                />
                <SocialProfileTab
                  onSubmit={onSubmit}
                  form={form}
                  isLoading={isLoading}
                />
              </div>
            </Tabs>
          </div>

          <CardFooter className="mt-8 border-t border-muted/10 bg-muted/5 px-8 py-5 text-foreground">
            <div className="flex w-full items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {form.formState.isDirty ? (
                  <span className="flex animate-pulse items-center text-primary/80">
                    <Icons.info className="mr-2 h-4 w-4" />
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Icons.check className="mr-2 h-4 w-4 text-green-500" />
                    No changes to save
                  </span>
                )}
              </div>

              <Button
                className={cn(
                  'relative overflow-hidden rounded-full border-2 border-primary bg-background px-10 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:from-primary/90 hover:to-primary/70',
                  form.formState.isDirty &&
                  'animate-pulse shadow-lg shadow-primary/20'
                )}
                disabled={isLoading || !form.formState.isDirty}
                type="submit"
              >
                <span
                  className={cn(
                    'absolute inset-0 h-full w-full bg-background text-foreground opacity-0 transition-opacity',
                    form.formState.isDirty && 'animate-shimmer'
                  )}
                />
                <span className="relative flex items-center text-foreground">
                  {isLoading ? (
                    <Icons.spinner className="mr-2.5 size-5 animate-spin rounded-full border-2 border-primary" />
                  ) : (
                    <Icons.check className="mr-2.5 size-5 rounded-full bg-primary" />
                  )}
                  Save Changes
                </span>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

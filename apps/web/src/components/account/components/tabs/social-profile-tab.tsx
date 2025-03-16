/**
 * Tab content for managing social media profiles
 *
 * @file Social Profile Tab Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { ProfileFormField } from '../profile-form-field';
import type { TabComponentProps } from '../../types/profile-types';
import { TabsContent } from '@/registry/default/potion-ui/tabs';

/**
 * Social profile tab component that displays and allows editing of social media
 * links
 *
 * @example
 *   <SocialProfileTab
 *     form={form}
 *     isLoading={isLoading}
 *     onSubmit={handleSubmit}
 *   />;
 *
 * @param props - Component props including form, loading state, and submit
 *   handler
 * @returns A tab content component for social media information
 */
export function SocialProfileTab({
  form,
  isLoading,
  onSubmit,
}: TabComponentProps) {
  return (
    <TabsContent className="mt-6 space-y-8" value="social">
      {/* LinkedIn profile field */}
      <ProfileFormField
        name="linkedinProfile"
        description="Your LinkedIn profile URL."
        tooltipDescription="Link to your professional LinkedIn profile to enhance networking opportunities and professional connections within the platform."
        label="LinkedIn Profile"
        placeholder="https://linkedin.com/in/yourprofile"
        control={form.control}
        icon={<Icons.link className="size-4 text-muted-foreground" />}
      />

      {/* Twitter profile field */}
      <ProfileFormField
        name="twitterProfile"
        description="Your Twitter profile URL."
        tooltipDescription="Link to your Twitter profile for social networking and communication features within the platform."
        label="Twitter Profile"
        placeholder="https://twitter.com/yourusername"
        control={form.control}
        icon={<Icons.link className="size-4 text-muted-foreground" />}
      />

      {/* GitHub profile field */}
      <ProfileFormField
        name="githubProfile"
        description="Your GitHub profile URL."
        tooltipDescription="Link to your GitHub profile to showcase your development projects and technical contributions."
        label="GitHub Profile"
        placeholder="https://github.com/yourusername"
        control={form.control}
        icon={<Icons.link className="size-4 text-muted-foreground" />}
      />

      {/* Tab-specific save button */}
      <div className="mt-4 flex justify-end">
        <Button
          className="rounded-full bg-primary px-6 py-2 hover:bg-primary/90"
          disabled={isLoading || !form.formState.isDirty}
          onClick={() => onSubmit(form.getValues())}
          type="button"
        >
          {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
          Save Social Info
        </Button>
      </div>
    </TabsContent>
  );
}

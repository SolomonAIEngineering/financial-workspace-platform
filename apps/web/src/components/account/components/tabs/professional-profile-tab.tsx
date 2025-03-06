/**
 * Tab content for professional details like job title and department
 *
 * @file Professional Profile Tab Component
 */

import { Icons } from '@/components/ui/icons';
import { Button } from '@/registry/default/potion-ui/button';
import { TabsContent } from '@/registry/default/potion-ui/tabs';

import type { TabComponentProps } from '../../types/profile-types';

import { ProfileFormField } from '../profile-form-field';

/**
 * Professional profile tab component that displays and allows editing of
 * job-related information
 *
 * @example
 *   <ProfessionalProfileTab
 *     form={form}
 *     isLoading={isLoading}
 *     onSubmit={handleSubmit}
 *   />;
 *
 * @param props - Component props including form, loading state, and submit
 *   handler
 * @returns A tab content component for professional profile information
 */
export function ProfessionalProfileTab({
  form,
  isLoading,
  onSubmit,
}: TabComponentProps) {
  return (
    <TabsContent className="mt-6 space-y-8" value="professional">
      {/* Job title field */}
      <ProfileFormField
        name="jobTitle"
        description="Your current job title or role."
        label="Job Title"
        placeholder="Senior Developer"
        control={form.control}
        icon={<Icons.file className="size-4 text-muted-foreground" />}
      />

      {/* Department field */}
      <ProfileFormField
        name="department"
        description="The department you work in."
        label="Department"
        placeholder="Engineering"
        control={form.control}
        icon={<Icons.document className="size-4 text-muted-foreground" />}
      />

      {/* Tab-specific save button */}
      <div className="mt-4 flex justify-end">
        <Button
          className="rounded-full bg-primary px-6 py-2 hover:bg-primary/90"
          disabled={isLoading || !form.formState.isDirty}
          onClick={() => {
            const values = form.getValues();
            void onSubmit(values);
          }}
          type="button"
        >
          {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
          Save Professional Info
        </Button>
      </div>
    </TabsContent>
  );
}

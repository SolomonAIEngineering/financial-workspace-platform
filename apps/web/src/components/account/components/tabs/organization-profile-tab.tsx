/**
 * Tab content for organization-related information
 *
 * @file Organization Profile Tab Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { ProfileFormField } from '../profile-form-field';
import type { TabComponentProps } from '../../types/profile-types';
import { TabsContent } from '@/registry/default/potion-ui/tabs';

/**
 * Organization profile tab component that displays and allows editing of
 * organization details
 *
 * @example
 *   <OrganizationProfileTab
 *     form={form}
 *     isLoading={isLoading}
 *     onSubmit={handleSubmit}
 *   />;
 *
 * @param props - Component props including form, loading state, and submit
 *   handler
 * @returns A tab content component for organization information
 */
export function OrganizationProfileTab({
  form,
  isLoading,
  onSubmit,
}: TabComponentProps) {
  return (
    <TabsContent className="mt-6 space-y-8" value="organization">
      {/* Organization name field */}
      <ProfileFormField
        name="organizationName"
        description="The name of your organization or company."
        tooltipDescription="This is the official name of your business as it appears on legal documents and registrations."
        label="Organization Name"
        placeholder="Acme Corp"
        control={form.control}
        icon={<Icons.settings className="size-4 text-muted-foreground" />}
      />

      {/* Organization unit field */}
      <ProfileFormField
        name="organizationUnit"
        description="Your specific business unit or division."
        tooltipDescription="Specific department, branch, or division within your organization that you belong to or represent."
        label="Organization Unit"
        placeholder="Product Development"
        control={form.control}
        icon={<Icons.document className="size-4 text-muted-foreground" />}
      />

      {/* Team name field */}
      <ProfileFormField
        name="teamName"
        description="The name of your team within the organization."
        tooltipDescription="The specific team you work with directly. This helps with internal communication and collaboration features."
        label="Team Name"
        placeholder="Frontend Team"
        control={form.control}
        icon={<Icons.user className="size-4 text-muted-foreground" />}
      />

      {/* Tab-specific save button */}
      <div className="mt-4 flex justify-end">
        <Button
          className="rounded-full bg-primary px-6 py-2 hover:bg-primary/90"
          disabled={isLoading || !form.formState.isDirty}
          onClick={() => void onSubmit(form.getValues())}
          type="button"
        >
          {isLoading && <Icons.spinner className="mr-2 size-4 animate-spin" />}
          Save Organization Info
        </Button>
      </div>
    </TabsContent>
  );
}

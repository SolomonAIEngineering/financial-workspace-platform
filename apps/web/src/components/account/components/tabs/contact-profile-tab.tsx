/**
 * Tab content for contact information and address details
 *
 * @file Contact Profile Tab Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { ProfileFormField } from '../profile-form-field';
import type { TabComponentProps } from '../../types/profile-types';
import { TabsContent } from '@/registry/default/potion-ui/tabs';

/**
 * Contact profile tab component that displays and allows editing of contact and
 * address information
 *
 * @example
 *   <ContactProfileTab
 *     form={form}
 *     isLoading={isLoading}
 *     onSubmit={handleSubmit}
 *   />;
 *
 * @param props - Component props including form, loading state, and submit
 *   handler
 * @returns A tab content component for contact information
 */
export function ContactProfileTab({
  form,
  isLoading,
  onSubmit,
}: TabComponentProps) {
  return (
    <TabsContent className="mt-6 space-y-8" value="contact">
      {/* Phone and business email fields */}
      <div className="grid gap-6 sm:grid-cols-2">
        <ProfileFormField
          name="phoneNumber"
          label="Phone Number"
          placeholder="+1 (555) 123-4567"
          tooltipDescription="Your primary personal phone number for account security and recovery purposes."
          control={form.control}
          icon={<Icons.message className="size-4 text-muted-foreground" />}
        />

        <ProfileFormField
          name="businessEmail"
          label="Business Email"
          placeholder="you@company.com"
          tooltipDescription="Your work email address used for business communications and notifications."
          control={form.control}
          icon={<Icons.message className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Business phone and office location fields */}
      <div className="grid gap-6 sm:grid-cols-2">
        <ProfileFormField
          name="businessPhone"
          label="Business Phone"
          placeholder="+1 (555) 987-6543"
          tooltipDescription="Your work phone or business contact number for professional communications."
          control={form.control}
          icon={<Icons.message className="size-4 text-muted-foreground" />}
        />

        <ProfileFormField
          name="officeLocation"
          label="Office Location"
          placeholder="Building 3, Floor 5"
          tooltipDescription="Physical location of your office or workspace to help with directory listings."
          control={form.control}
          icon={<Icons.info className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Address line fields */}
      <ProfileFormField
        name="addressLine1"
        label="Address Line 1"
        placeholder="123 Main St"
        tooltipDescription="First line of your address including street number and name."
        control={form.control}
        icon={<Icons.info className="size-4 text-muted-foreground" />}
      />

      <ProfileFormField
        name="addressLine2"
        label="Address Line 2"
        placeholder="Apt 4B"
        tooltipDescription="Additional address information like apartment, suite, or unit number (if applicable)."
        control={form.control}
        icon={<Icons.info className="size-4 text-muted-foreground" />}
      />

      {/* City, state, postal code fields */}
      <div className="grid gap-6 sm:grid-cols-3">
        <ProfileFormField
          name="city"
          label="City"
          placeholder="San Francisco"
          tooltipDescription="City or town where your address is located."
          control={form.control}
          icon={<Icons.settings className="size-4 text-muted-foreground" />}
        />

        <ProfileFormField
          name="state"
          label="State/Province"
          placeholder="CA"
          tooltipDescription="State, province, or region where your address is located."
          control={form.control}
          icon={<Icons.globe className="size-4 text-muted-foreground" />}
        />

        <ProfileFormField
          name="postalCode"
          label="Postal Code"
          placeholder="94103"
          tooltipDescription="ZIP or postal code for your address, used for mail delivery and local services."
          control={form.control}
          icon={<Icons.info className="size-4 text-muted-foreground" />}
        />
      </div>

      {/* Country field */}
      <ProfileFormField
        name="country"
        label="Country"
        placeholder="United States"
        tooltipDescription="Country where your address is located, used for international features and region-specific services."
        control={form.control}
        icon={<Icons.globe className="size-4 text-muted-foreground" />}
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
          Save Contact Info
        </Button>
      </div>
    </TabsContent>
  );
}

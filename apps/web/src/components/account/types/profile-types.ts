/**
 * Type definitions for profile section components
 *
 * @file Profile Types
 */

import { ReactNode } from 'react';
import { z } from 'zod';

/** Constants for form validation */
export const PROFILE_CONSTANTS = {
  /** Maximum allowed length for email fields */
  MAX_EMAIL_LENGTH: 255,
  /** Maximum allowed length for name fields */
  MAX_NAME_LENGTH: 100,
  /** Maximum allowed length for profile image URLs */
  MAX_PROFILE_IMAGE_URL_LENGTH: 500,
  /** Maximum allowed length for short text fields */
  MAX_SHORT_TEXT_LENGTH: 255,
  /** Maximum allowed length for long text fields like bio */
  MAX_TEXT_LENGTH: 1000,
};

/**
 * Zod schema for profile form validation
 *
 * Defines validation rules for all profile form fields
 */
export const profileFormSchema = z.object({
  // Address fields
  addressLine1: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  addressLine2: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_TEXT_LENGTH, 'Bio is too long')
    .optional()
    .nullable(),
  businessEmail: z
    .string()
    .email('Invalid business email')
    .max(PROFILE_CONSTANTS.MAX_EMAIL_LENGTH)
    .optional()
    .nullable(),
  businessPhone: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  city: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),

  country: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  department: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),

  email: z
    .string()
    .email('Invalid email address')
    .max(PROFILE_CONSTANTS.MAX_EMAIL_LENGTH, 'Email is too long'),
  firstName: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  githubProfile: z
    .string()
    .url('Invalid URL')
    .max(PROFILE_CONSTANTS.MAX_PROFILE_IMAGE_URL_LENGTH)
    .optional()
    .nullable(),

  // Professional details
  jobTitle: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  language: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  lastName: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  // Social profiles
  linkedinProfile: z
    .string()
    .url('Invalid URL')
    .max(PROFILE_CONSTANTS.MAX_PROFILE_IMAGE_URL_LENGTH)
    .optional()
    .nullable(),

  // Basic profile
  name: z
    .string()
    .min(1, 'Name is required')
    .max(PROFILE_CONSTANTS.MAX_NAME_LENGTH, 'Name is too long'),
  officeLocation: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  // Organization data
  organizationName: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  organizationUnit: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  // Contact information
  phoneNumber: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  postalCode: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),

  profileImageUrl: z
    .string()
    .url('Please enter a valid URL')
    .max(PROFILE_CONSTANTS.MAX_PROFILE_IMAGE_URL_LENGTH, 'URL is too long')
    .optional()
    .nullable(),
  state: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  teamName: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),

  // Preferences
  timezone: z
    .string()
    .max(PROFILE_CONSTANTS.MAX_SHORT_TEXT_LENGTH)
    .optional()
    .nullable(),
  twitterProfile: z
    .string()
    .url('Invalid URL')
    .max(PROFILE_CONSTANTS.MAX_PROFILE_IMAGE_URL_LENGTH)
    .optional()
    .nullable(),
});

/**
 * Props for the ProfileFormField component
 *
 * @interface ProfileFormFieldProps
 */
export interface ProfileFormFieldProps {
  /** The form control from react-hook-form */
  control: any;
  /** React node for the field icon */
  icon: ReactNode;
  /** Label displayed above the field */
  label: string;
  /** The field name matching the schema */
  name: string;
  /** Placeholder text shown when field is empty */
  placeholder: string;
  /** Optional description displayed below the field */
  description?: string;
  /** Optional detailed description for the tooltip */
  tooltipDescription?: string;
  /** Input type (text, textarea, etc.) */
  type?: string;
}

/** Profile form values type derived from the Zod schema */
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/**
 * Interface for all profile-related mutations
 *
 * @interface ProfileMutations
 */
export interface ProfileMutations {
  /** Mutation for contact information updates */
  updateContactInfoMutation: any;
  /** Mutation for organization information updates */
  updateOrganizationInfoMutation: any;
  /** Mutation for professional profile updates */
  updateProfessionalProfileMutation: any;
  /** Mutation for basic profile updates */
  updateProfileMutation: any;
  /** Mutation for social profiles updates */
  updateSocialProfilesMutation: any;
}

/**
 * Props for the ProfileSection component
 *
 * @interface ProfileSectionProps
 */
export interface ProfileSectionProps {
  /** User data for profile display and defaults */
  user: any;
  /** User settings data */
  userSettings: any;
}

/**
 * Common props shared by all tab components
 *
 * @interface TabComponentProps
 */
export interface TabComponentProps {
  /** Form instance from react-hook-form */
  form: any;
  /** Whether the form is currently submitting */
  isLoading: boolean;
  /** Function called when saving the tab's data */
  onSubmit: (data: ProfileFormValues) => Promise<void>;
}

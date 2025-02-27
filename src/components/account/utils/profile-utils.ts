/**
 * Utility functions for handling profile data
 *
 * @file Profile Utilities
 */

/**
 * Filters out null and undefined values from an object
 *
 * @example
 *   const filtered = filterEmptyValues({ name: 'John', bio: null });
 *   // Result: { name: 'John' }
 *
 * @param data - Object to filter
 * @returns A new object with null and undefined values removed
 */
export const filterEmptyValues = (data: Record<string, any>) => {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v != null));
};

/**
 * Gets the user's initials from name or other properties
 *
 * @example
 *   const initials = getUserInitials('John', 'Doe', '');
 *   // Result: 'JD'
 *
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @param displayName - User's display name
 * @returns A string with the user's initials or a default
 */
export const getUserInitials = (
  firstName?: string | null,
  lastName?: string | null,
  displayName?: string | null
): string => {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`;
  }
  if (displayName) {
    const nameParts = displayName.trim().split(' ');

    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }

    return displayName.slice(0, 2).toUpperCase();
  }

  return 'U';
};

/**
 * Prepares tab-specific data for submission
 *
 * @example
 *   const tabData = getTabData('basic', formValues);
 *
 * @param tabName - Current active tab name
 * @param data - Complete form data
 * @returns An object with only the relevant fields for the specified tab
 */
export const getTabData = (tabName: string, data: Record<string, any>) => {
  switch (tabName) {
    case 'basic': {
      return {
        bio: data.bio || '', // Ensure bio is explicitly included even if empty
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name,
        profileImageUrl: data.profileImageUrl,
      };
    }
    case 'contact': {
      return {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        city: data.city,
        country: data.country,
        officeLocation: data.officeLocation,
        phoneNumber: data.phoneNumber,
        postalCode: data.postalCode,
        state: data.state,
      };
    }
    case 'organization': {
      return {
        organizationName: data.organizationName,
        organizationUnit: data.organizationUnit,
        teamName: data.teamName,
      };
    }
    case 'professional': {
      return {
        department: data.department,
        jobTitle: data.jobTitle,
      };
    }
    case 'social': {
      return {
        githubProfile: data.githubProfile,
        linkedinProfile: data.linkedinProfile,
        twitterProfile: data.twitterProfile,
      };
    }
    default: {
      return data;
    }
  }
};

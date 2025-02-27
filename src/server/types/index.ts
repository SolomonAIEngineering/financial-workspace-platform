export interface Session {
  id: string;
  user_id: string;
  expires_at: Date;
  ip_address: string | null;
  user_agent: string | null;
}

export interface OauthAccount {
  id: string;
  providerId: string;
  providerUserId: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  password_hash: string | null;
  email: string | null;
  role: UserRole;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  timezone: string | null;
  language: string | null;
  jobTitle: string | null;
  department: string | null;
  employeeId: string | null;
  hireDate: Date | null;
  yearsOfExperience: number | null;
  skills: string[];
  phoneNumber: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  officeLocation: string | null;
  organizationName: string | null;
  organizationUnit: string | null;
  managerUserId: string | null;
  teamName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  notificationPreferences: any | null;
  displayPreferences: any | null;
  documentPreferences: any | null;
  linkedinProfile: string | null;
  twitterProfile: string | null;
  githubProfile: string | null;
  version: number;
  stripeCustomerId: string | null;
  accountStatus: AccountStatus;
  lastLoginAt: Date | null;
  uploadLimit: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Document {
  id: string;
  templateId: string | null;
  userId: string;
  parentDocumentId: string | null;
  title: string | null;
  content: string | null;
  contentRich: any | null;
  coverImage: string | null;
  icon: string | null;
  isPublished: boolean;
  isArchived: boolean;
  pinned: boolean;
  tags: string[];
  isTemplate: boolean;
  status: string;
  textStyle: TextStyle;
  smallText: boolean;
  fullWidth: boolean;
  lockPage: boolean;
  toc: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  userId: string;
  title: string | null;
  contentRich: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discussion {
  id: string;
  documentId: string;
  userId: string;
  documentContent: string;
  documentContentRich: any | null;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  discussionId: string;
  content: string;
  contentRich: any | null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  userId: string;
  documentId: string | null;
  size: number;
  url: string;
  appUrl: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserRole = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPERADMIN: "SUPERADMIN",
  MANAGER: "MANAGER",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
  GUEST: "GUEST",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TextStyle = {
  DEFAULT: "DEFAULT",
  SERIF: "SERIF",
  MONO: "MONO",
} as const;
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
  PENDING: "PENDING",
  ARCHIVED: "ARCHIVED",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

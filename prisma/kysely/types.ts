import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const UserRole = {
    USER: "USER",
    ADMIN: "ADMIN",
    SUPERADMIN: "SUPERADMIN",
    MANAGER: "MANAGER",
    EDITOR: "EDITOR",
    VIEWER: "VIEWER",
    GUEST: "GUEST"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const TextStyle = {
    DEFAULT: "DEFAULT",
    SERIF: "SERIF",
    MONO: "MONO"
} as const;
export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];
export const AccountStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    SUSPENDED: "SUSPENDED",
    PENDING: "PENDING",
    ARCHIVED: "ARCHIVED"
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
export type Comment = {
    id: string;
    userId: string;
    discussionId: string;
    content: string;
    contentRich: unknown | null;
    isEdited: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type Discussion = {
    id: string;
    documentId: string;
    userId: string;
    documentContent: string;
    documentContentRich: unknown | null;
    isResolved: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type Document = {
    id: string;
    templateId: string | null;
    userId: string;
    parentDocumentId: string | null;
    title: string | null;
    content: string | null;
    contentRich: unknown | null;
    coverImage: string | null;
    icon: string | null;
    isPublished: Generated<boolean>;
    isArchived: Generated<boolean>;
    pinned: Generated<boolean>;
    tags: Generated<string[]>;
    isTemplate: Generated<boolean>;
    status: Generated<string>;
    textStyle: Generated<TextStyle>;
    smallText: Generated<boolean>;
    fullWidth: Generated<boolean>;
    lockPage: Generated<boolean>;
    toc: Generated<boolean>;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type DocumentVersion = {
    id: string;
    documentId: string;
    userId: string;
    title: string | null;
    contentRich: unknown | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type File = {
    id: string;
    userId: string;
    documentId: string | null;
    size: number;
    url: string;
    appUrl: string;
    type: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type OauthAccount = {
    id: string;
    providerId: string;
    providerUserId: string;
    userId: string;
};
export type Session = {
    id: string;
    user_id: string;
    expires_at: Timestamp;
    ip_address: string | null;
    user_agent: string | null;
};
export type User = {
    id: string;
    username: string;
    password_hash: string | null;
    email: string | null;
    role: Generated<UserRole>;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    bio: string | null;
    timezone: string | null;
    language: Generated<string | null>;
    jobTitle: string | null;
    department: string | null;
    employeeId: string | null;
    hireDate: Timestamp | null;
    yearsOfExperience: number | null;
    skills: Generated<string[]>;
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
    notificationPreferences: unknown | null;
    displayPreferences: unknown | null;
    documentPreferences: unknown | null;
    linkedinProfile: string | null;
    twitterProfile: string | null;
    githubProfile: string | null;
    version: Generated<number>;
    stripeCustomerId: string | null;
    accountStatus: Generated<AccountStatus>;
    lastLoginAt: Timestamp | null;
    uploadLimit: Generated<number>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    deletedAt: Timestamp | null;
};
export type DB = {
    Comment: Comment;
    Discussion: Discussion;
    Document: Document;
    DocumentVersion: DocumentVersion;
    File: File;
    OauthAccount: OauthAccount;
    Session: Session;
    User: User;
};

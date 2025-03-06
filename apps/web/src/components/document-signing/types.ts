export interface Document {
  id: string;
  expiresAt: string;
  pageCount: number;
  previewUrl: string;
  recipients: Recipient[];
  sender: {
    email: string;
    name: string;
  };
  status: SigningStatus;
  title: string;
  updatedAt: string;
  isFavorited?: boolean;
  priority?: PriorityLevel;
  tags?: string[];
}

export type FilterMode = SigningStatus | 'all';

export type PriorityLevel = 'high' | 'low' | 'medium' | 'none';

export interface Recipient {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'rejected' | 'signed' | 'viewed';
  signedAt?: string;
}

// Types for our document signing app
export type SigningStatus =
  | 'expired'
  | 'pending'
  | 'rejected'
  | 'signed'
  | 'viewed';

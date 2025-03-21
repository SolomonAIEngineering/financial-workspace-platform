/**
 * Transaction status constants for the financial management platform These
 * statuses represent the various states a transaction can be in throughout its
 * lifecycle, including approval workflows.
 */

export enum TransactionStatus {
  // Initial states
  PENDING = 'Pending',
  COMPLETED = 'Completed',

  // Approval workflow states
  AWAITING_REVIEW = 'Awaiting Review',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',

  // Special states
  FLAGGED = 'Flagged for Attention',
  DISPUTED = 'Disputed',
  NEEDS_DOCUMENTATION = 'Needs Documentation',
  REQUIRES_APPROVAL = 'Requires Approval',

  // Financial states
  RECONCILED = 'Reconciled',
  PARTIALLY_RECONCILED = 'Partially Reconciled',

  // Verification states
  VERIFIED = 'Verified',
  UNVERIFIED = 'Unverified',
}

/** Transaction status metadata including display colors and descriptions */
export const TransactionStatusMetadata: Record<
  TransactionStatus,
  {
    label: string;
    badgeType:
      | 'default'
      | 'success'
      | 'warning'
      | 'destructive'
      | 'outline'
      | 'secondary';
    description: string;
    canTransitionTo: TransactionStatus[];
    requiresApproval: boolean;
  }
> = {
  [TransactionStatus.PENDING]: {
    label: 'Pending',
    badgeType: 'warning',
    description:
      'Transaction has been recorded but not confirmed by the financial institution',
    canTransitionTo: [
      TransactionStatus.COMPLETED,
      TransactionStatus.AWAITING_REVIEW,
      TransactionStatus.FLAGGED,
    ],
    requiresApproval: false,
  },
  [TransactionStatus.COMPLETED]: {
    label: 'Completed',
    badgeType: 'success',
    description: 'Transaction has been confirmed by the financial institution',
    canTransitionTo: [
      TransactionStatus.AWAITING_REVIEW,
      TransactionStatus.RECONCILED,
      TransactionStatus.FLAGGED,
      TransactionStatus.DISPUTED,
    ],
    requiresApproval: false,
  },
  [TransactionStatus.AWAITING_REVIEW]: {
    label: 'Awaiting Review',
    badgeType: 'secondary',
    description: 'Transaction is waiting for team member review',
    canTransitionTo: [
      TransactionStatus.UNDER_REVIEW,
      TransactionStatus.APPROVED,
      TransactionStatus.REJECTED,
      TransactionStatus.NEEDS_DOCUMENTATION,
    ],
    requiresApproval: true,
  },
  [TransactionStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    badgeType: 'secondary',
    description: 'Transaction is currently being reviewed by a team member',
    canTransitionTo: [
      TransactionStatus.APPROVED,
      TransactionStatus.REJECTED,
      TransactionStatus.NEEDS_DOCUMENTATION,
      TransactionStatus.REQUIRES_APPROVAL,
    ],
    requiresApproval: true,
  },
  [TransactionStatus.APPROVED]: {
    label: 'Approved',
    badgeType: 'success',
    description: 'Transaction has been approved by an authorized team member',
    canTransitionTo: [
      TransactionStatus.RECONCILED,
      TransactionStatus.FLAGGED,
      TransactionStatus.DISPUTED,
    ],
    requiresApproval: false,
  },
  [TransactionStatus.REJECTED]: {
    label: 'Rejected',
    badgeType: 'destructive',
    description: 'Transaction has been rejected by an authorized team member',
    canTransitionTo: [
      TransactionStatus.UNDER_REVIEW,
      TransactionStatus.DISPUTED,
      TransactionStatus.NEEDS_DOCUMENTATION,
    ],
    requiresApproval: false,
  },
  [TransactionStatus.FLAGGED]: {
    label: 'Flagged for Attention',
    badgeType: 'destructive',
    description: 'Transaction has been flagged as requiring special attention',
    canTransitionTo: [
      TransactionStatus.UNDER_REVIEW,
      TransactionStatus.DISPUTED,
      TransactionStatus.NEEDS_DOCUMENTATION,
    ],
    requiresApproval: true,
  },
  [TransactionStatus.DISPUTED]: {
    label: 'Disputed',
    badgeType: 'destructive',
    description: 'Transaction is being disputed with the financial institution',
    canTransitionTo: [
      TransactionStatus.APPROVED,
      TransactionStatus.REJECTED,
      TransactionStatus.COMPLETED,
    ],
    requiresApproval: true,
  },
  [TransactionStatus.NEEDS_DOCUMENTATION]: {
    label: 'Needs Documentation',
    badgeType: 'warning',
    description:
      'Transaction requires additional documentation before it can be processed',
    canTransitionTo: [
      TransactionStatus.UNDER_REVIEW,
      TransactionStatus.APPROVED,
      TransactionStatus.REJECTED,
    ],
    requiresApproval: true,
  },
  [TransactionStatus.REQUIRES_APPROVAL]: {
    label: 'Requires Approval',
    badgeType: 'warning',
    description: 'Transaction requires approval from a senior team member',
    canTransitionTo: [TransactionStatus.APPROVED, TransactionStatus.REJECTED],
    requiresApproval: true,
  },
  [TransactionStatus.RECONCILED]: {
    label: 'Reconciled',
    badgeType: 'success',
    description: 'Transaction has been reconciled with financial statements',
    canTransitionTo: [TransactionStatus.DISPUTED, TransactionStatus.FLAGGED],
    requiresApproval: false,
  },
  [TransactionStatus.PARTIALLY_RECONCILED]: {
    label: 'Partially Reconciled',
    badgeType: 'warning',
    description:
      'Transaction has been partially reconciled with financial statements',
    canTransitionTo: [
      TransactionStatus.RECONCILED,
      TransactionStatus.DISPUTED,
      TransactionStatus.FLAGGED,
    ],
    requiresApproval: false,
  },
  [TransactionStatus.VERIFIED]: {
    label: 'Verified',
    badgeType: 'success',
    description: 'Transaction has been verified by team members',
    canTransitionTo: [
      TransactionStatus.DISPUTED,
      TransactionStatus.FLAGGED,
      TransactionStatus.RECONCILED,
    ],
    requiresApproval: false,
  },
  [TransactionStatus.UNVERIFIED]: {
    label: 'Unverified',
    badgeType: 'warning',
    description: 'Transaction still needs to be verified by team members',
    canTransitionTo: [
      TransactionStatus.VERIFIED,
      TransactionStatus.FLAGGED,
      TransactionStatus.NEEDS_DOCUMENTATION,
    ],
    requiresApproval: true,
  },
};

/**
 * Helper function to get status options for dropdowns Returns an array of
 * options with label and value properties
 */
export const getTransactionStatusOptions = () => {
  return Object.values(TransactionStatus).map((status) => ({
    label: TransactionStatusMetadata[status].label,
    value: status,
  }));
};

/** Helper function to determine if a status change is allowed */
export const isStatusTransitionAllowed = (
  currentStatus: TransactionStatus,
  newStatus: TransactionStatus
): boolean => {
  // Allow staying in the same status
  if (currentStatus === newStatus) return true;

  // Check if new status is in the allowed transitions
  return TransactionStatusMetadata[currentStatus].canTransitionTo.includes(
    newStatus
  );
};

/** Helper function to get an appropriate badge type for a status */
export const getStatusBadgeType = (
  status: string
):
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline'
  | 'secondary' => {
  // Handle legacy status values
  if (status === 'Pending') return 'warning';
  if (status === 'Completed') return 'success';

  // Handle enum status values
  const enumStatus = status as TransactionStatus;
  if (TransactionStatusMetadata[enumStatus]) {
    return TransactionStatusMetadata[enumStatus].badgeType;
  }

  // Default fallback
  return 'default';
};

/**
 * Export all email templates from the email package.
 * This file serves as the main entry point for accessing all email templates.
 * @module emails
 */

// Authentication related emails
export { default as LoginLink } from './login-link'
export { default as PasswordUpdated } from './password-updated'
export { default as ResetPasswordLink } from './reset-password-link'
export { default as VerifyEmail } from './verify-email'
export { default as WelcomeEmail } from './welcome-email'
export { default as WorkspaceInvite } from './workspace-invite'

// Invoice related emails
export { default as Invoice } from './invoice'
export { default as InvoiceComment } from './invoice-comment'
export { default as InvoiceOverdue } from './invoice-overdue'
export { default as InvoicePaid } from './invoice-paid'
export { default as InvoiceReminder } from './invoice-reminder'

// Lead management emails
export { default as LeadActivitySummary } from './lead-activity-summary'
export { default as LeadAssignment } from './lead-assignment'
export { default as LeadScoringUpdate } from './lead-scoring-update'
export { default as NewLeadAcquired } from './new-lead-acquired'
export { default as WorkspaceLeadsSummary } from './workspace-leads-summary'

// Sales related emails
export { default as DealClosed } from './deal-closed'
export { default as MeetingScheduled } from './meeting-scheduled'
export { default as NewSaleCreated } from './new-sale-created'
export { default as PipelineStageUpdate } from './pipeline-stage-update'
export { default as SalesInsightReport } from './sales-insight-report'
export { default as SalesPerformanceSummary } from './sales-performance-summary'
export { default as SalesTargetAchievement } from './sales-target-achievement'

// Transaction related emails
export { default as Transactions } from './transactions'

// Domain related emails
export { default as DomainClaimed } from './domain-claimed'
export { default as DomainDeleted } from './domain-deleted'
export { default as DomainTransferred } from './domain-transferred'
export { default as InvalidDomain } from './invalid-domain'

// Partner related emails
export { default as PartnerInvite } from './partner-invite'
export { default as PartnerPayoutSent } from './partner-payout-sent'
export { default as ReferralInvite } from './referral-invite'

// API and integration emails
export { default as ApiKeyCreated } from './api-key-created'
export { default as IntegrationInstalled } from './integration-installed'
export { default as WebhookAdded } from './webhook-added'
export { default as WebhookDisabled } from './webhook-disabled'

// Analytics and usage emails
export { default as ClicksExceeded } from './clicks-exceeded'
export { default as ClicksSummary } from './clicks-summary'
export { default as LinksLimit } from './links-limit'

// System and account emails
export { default as BankReconnectAlert } from './bank-reconnect-alert'
export { default as ConnectionExpire } from './connection-expire'
export { default as ConnectionIssue } from './connection-issue'
export { default as CustomerFeedbackAlert } from './customer-feedback-alert'
export { default as DubWrapped } from './dub-wrapped'
export { default as FailedPayment } from './failed-payment'
export { default as FeedbackEmail } from './feedback-email'
export { default as RebrandEmail } from './rebrand-email'
export { default as UpgradeEmail } from './upgrade-email'

// Utility function for sending emails
export { sendEmailViaResend } from './send-via-resend'

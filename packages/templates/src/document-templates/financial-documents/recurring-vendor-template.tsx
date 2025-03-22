/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Recurring Vendor Payment Template
export const recurringVendorTemplate: any = (
  <fragment>
    <hh1>Recurring Vendor Payment Record</hh1>
    <hp>
      Streamlined documentation for regular, scheduled payments to
      subscription-based vendors, service providers, and ongoing contractors.
    </hp>

    <hh3>Vendor Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor name: [Vendor Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor ID/Account number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor contact person: [Contact Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact email/phone: [Email/Phone]</htext>
    </hp>

    <hh3>Subscription/Service Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Service description: [Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Subscription/Contract ID: [ID]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Billing frequency: [Monthly/Quarterly/Annual]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract start date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract end/renewal date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Auto-renewal: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Notice period for cancellation: [Time Period]</htext>
    </hp>

    <hh3>Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Regular payment amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Current payment amount (if different): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [ACH/Credit Card/EFT]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Automatic payment enabled: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment account details: [Last 4 digits/Name on account]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID: [ID/Number]</htext>
    </hp>

    <hh3>Current Payment Cycle</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Current billing period: [Start Date - End Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment due date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date paid: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment status: [Scheduled/Processing/Complete]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Usage metrics for billing period: [Details]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Associated department/cost center: [Department/Cost Center]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expense category/GL account: [Category/Account]</htext>
    </hp>
    <hp>
      <htext>
        Payment notes: [Changes to subscription, rate increases, service
        adjustments, etc.]
      </htext>
    </hp>
    <hp>
      <htext>Review date for service evaluation: [Date]</htext>
    </hp>
  </fragment>
)

export default recurringVendorTemplate

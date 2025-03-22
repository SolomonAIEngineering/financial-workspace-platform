/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Subscription Renewal Template with enhanced details
export const subscriptionRenewalTemplate: any = (
  <fragment>
    <hh1>Subscription Renewal Record</hh1>
    <hp>
      Detailed documentation of recurring payments and subscription renewals for
      services, ensuring consistent revenue tracking and customer relationship
      management.
    </hp>

    <hh3>Customer Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Customer/Account name: [Full Name/Business Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Customer ID: [ID Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Primary contact person: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Email address: [Email]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Phone number: [Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Billing address: [Address]</htext>
    </hp>

    <hh3>Subscription Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Subscription ID: [ID Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Subscription type/plan: [Basic/Standard/Premium/Enterprise/Custom]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Service/Product name: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Service description: [Brief Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Number of licenses/users: [Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Features included: [List Key Features]</htext>
    </hp>

    <hh3>Billing Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Renewal amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Previous billing amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Price change: $[Amount] ([Increase/Decrease/No Change])</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Discount applied: $[Amount] or [Percentage]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Promo code used: [Code]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>

    <hh3>Renewal Schedule</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Billing cycle: [Monthly/Quarterly/Semi-Annual/Annual/Biennial]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Previous renewal date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Current renewal date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Next renewal date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Auto-renewal status: [Enabled/Disabled]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract term: [Month-to-Month/Annual/Multi-Year]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract end date: [Date]</htext>
    </hp>

    <hh3>Payment Processing</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Credit Card/ACH/Invoice/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment card/account: [Last 4 digits]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Card expiration date: [MM/YY]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID: [ID Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment status: [Successful/Failed/Pending]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt/Invoice number: [Number]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Service Changes and Notes</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Change in service: [Upgrade/Downgrade/No Change]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>New features added: [Features]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Features removed: [Features]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Customer satisfaction score: [1-10 or N/A]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account health status: [Good Standing/At Risk/VIP]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Renewal processed by: [Employee Name]</htext>
    </hp>
    <hp>
      <htext>
        Additional notes: [Customer communication history, special arrangements,
        usage statistics, upsell opportunities, etc.]
      </htext>
    </hp>
  </fragment>
)

export default subscriptionRenewalTemplate

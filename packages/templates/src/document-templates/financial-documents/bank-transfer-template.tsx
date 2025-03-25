/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Bank Transfer Template with enhanced details
export const bankTransferTemplate: any = (
  <fragment>
    <hh1>Bank Transfer Record</hh1>
    <hp>
      Comprehensive documentation of bank transfers between accounts for
      accurate record-keeping, reconciliation, audit trails, and compliance
      purposes.
    </hp>

    <hh3>Source Account Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>From account name: [Account Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>From account number: [Last 4 digits]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Bank name: [Bank Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account type: [Checking/Savings/Business/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>

    <hh3>Destination Account Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>To account name: [Account Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>To account number: [Last 4 digits]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Bank name: [Bank Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account type: [Checking/Savings/Business/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Routing/SWIFT/BIC: [Last 4 digits]</htext>
    </hp>

    <hh3>Transfer Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Transfer amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transfer fee (if any): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Exchange rate (if applicable): [Rate]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date initiated: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expected completion date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Actual completion date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transfer type: [Wire/ACH/Internal/International]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Frequency: [One-time/Recurring]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Recurrence schedule (if recurring): [Daily/Weekly/Monthly/Quarterly]
      </htext>
    </hp>

    <hh3>Authorization and Tracking</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Reference number: [Ref #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Confirmation number: [Conf #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Authorized by: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Authorization method: [Online/Phone/In-person]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Two-factor authentication used: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>IP address (if online): [IP Address]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Business Purpose and Accounting</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Transfer purpose: [Cash Flow Management/Investment/Expense
        Payment/Loan/Other]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Associated invoice/PO (if applicable): [Invoice/PO #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Project/Department code: [Code]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Budget category: [Category]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax implications: [Taxable/Non-taxable]</htext>
    </hp>
    <hp>
      <htext>
        Additional notes: [Detailed description of purpose, special
        instructions, associated transactions, etc.]
      </htext>
    </hp>
  </fragment>
)

export default bankTransferTemplate

/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Client Payment Template with enhanced details
export const clientPaymentTemplate: any = (
  <fragment>
    <hh1>Client Payment Receipt</hh1>
    <hp>
      Comprehensive documentation of payments received from clients for accurate
      financial record-keeping, reconciliation, and tax reporting purposes.
    </hp>

    <hh3>Client Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Client name: [Client Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Client ID/Account number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Client contact person: [Contact Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact email: [Email]</htext>
    </hp>

    <hh3>Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Cash/Check/Credit Card/ACH/Wire Transfer]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID/Check number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Exchange rate (if applicable): [Rate]</htext>
    </hp>

    <hh3>Invoice Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number(s): [Invoice #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice total: $[Total]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment status: [Paid in Full/Partial Payment]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Remaining balance (if any): $[Amount]</htext>
    </hp>

    <hh3>Receipt Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Date received: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt number: [Receipt #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Received by: [Employee Name]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payment terms: [Net 30/Upon Receipt/etc.]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account credited: [Account Name/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax implications: [Yes/No - Details]</htext>
    </hp>
    <hp>
      <htext>
        Additional notes: [Notes on payment conditions, special arrangements,
        etc.]
      </htext>
    </hp>
  </fragment>
)

export default clientPaymentTemplate

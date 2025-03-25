/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Refund Processed Template with enhanced details
export const refundProcessedTemplate: any = (
  <fragment>
    <hh1>Refund Processed</hh1>
    <hp>
      Comprehensive documentation of customer refunds for returns,
      cancellations, or billing adjustments, ensuring accurate financial records
      and customer satisfaction tracking.
    </hp>

    <hh3>Customer Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Customer name: [Full Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Customer ID/Account number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact email: [Email]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact phone: [Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Billing address: [Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Shipping address (if different): [Address]</htext>
    </hp>

    <hh3>Original Transaction Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Original sale date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Original invoice/receipt number: [Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Original payment method: [Credit Card/Cash/Check/ACH/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Original payment amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Original transaction ID: [ID]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Sales channel: [In-store/Online/Phone/Other]</htext>
    </hp>

    <hh3>Refund Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Refund amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Full or partial refund: [Full/Partial]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Refund method: [Original Payment Method/Store Credit/Exchange/Other]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Refund transaction ID: [ID]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax amount refunded: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Shipping amount refunded: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Restocking fee (if applicable): $[Amount]</htext>
    </hp>

    <hh3>Items Refunded</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Item 1: [Description] - Quantity: [Qty] - Price: $[Price] - Subtotal:
        $[Subtotal]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Item 2: [Description] - Quantity: [Qty] - Price: $[Price] - Subtotal:
        $[Subtotal]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Item condition: [New/Used/Damaged/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Item returned: [Yes/No]</htext>
    </hp>

    <hh3>Processing Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Date refund requested: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date refund processed: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expected date in customer account: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Processed by: [Employee Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Approved by: [Manager Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Refund status: [Processed/Pending/Completed]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Reason for refund: [Defective/Wrong Item/Customer Dissatisfaction/Order
        Cancellation/Other]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Return authorization (RMA) number: [Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Customer feedback: [Feedback]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Resolution offered: [Full Refund/Partial Refund/Exchange/Credit/Other]
      </htext>
    </hp>
    <hp>
      <htext>
        Notes: [Detailed explanation, customer communication history, quality
        control issues, inventory adjustments, etc.]
      </htext>
    </hp>
  </fragment>
)

export default refundProcessedTemplate

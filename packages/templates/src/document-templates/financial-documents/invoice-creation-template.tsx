/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Invoice Creation Template with enhanced details
export const invoiceCreationTemplate: any = (
  <fragment>
    <hh1>Invoice Creation</hh1>
    <hp>
      Detailed documentation for new invoices sent to clients for products
      delivered or services rendered, ensuring proper record-keeping and
      facilitating timely payments.
    </hp>

    <hh3>Company Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Company name: [Your Company Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Address: [Full Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Phone number: [Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Email: [Email]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Website: [Website]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax ID/EIN: [Tax ID/EIN]</htext>
    </hp>

    <hh3>Client Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Client name: [Client Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact person: [Contact Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Billing address: [Full Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Shipping address (if different): [Full Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Email: [Email]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Phone: [Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Client ID/Account number: [ID/Number]</htext>
    </hp>

    <hh3>Invoice Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Purchase order number (if applicable): [PO #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice date: [Issue Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Due date: [Due Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment terms: [Net 30/15/Upon Receipt]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Sales rep/Account manager: [Name]</htext>
    </hp>

    <hh3>Line Items</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Item 1: [Description] - Quantity: [Qty] - Unit price: $[Price] - Amount:
        $[Total]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Item 2: [Description] - Quantity: [Qty] - Unit price: $[Price] - Amount:
        $[Total]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Item 3: [Description] - Quantity: [Qty] - Unit price: $[Price] - Amount:
        $[Total]
      </htext>
    </hp>

    <hh3>Totals</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Subtotal: $[Subtotal]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Discount (if applicable): $[Discount Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax rate: [Rate]%</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax amount: $[Tax Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Shipping/Handling: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total amount due: $[Total Due]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>

    <hh3>Payment Instructions</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Payment methods accepted: [Credit Card/Check/ACH/Wire Transfer]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Bank name: [Bank Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account name: [Account Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account number: [Last 4 digits]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Routing number: [Last 4 digits]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment portal URL: [URL]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hp>
      <htext>
        Services/products included: [Detailed description of services/products
        provided, delivery dates, project milestones, or other relevant
        information]
      </htext>
    </hp>
    <hp>
      <htext>
        Additional notes: [Late payment policy, return policy, warranty
        information, or other terms and conditions]
      </htext>
    </hp>
  </fragment>
)

export default invoiceCreationTemplate

/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// High-Volume/Small Vendor Payment Template
export const smallVendorTemplate: any = (
  <fragment>
    <hh1>Small Vendor Payment Record</hh1>
    <hp>
      Streamlined template for managing high-volume, low-dollar transactions
      with small suppliers, local vendors, and one-time service providers.
    </hp>

    <hh3>Vendor Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor name: [Vendor Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor category: [Retail/Service/Supplier/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact information: [Phone/Email]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor onboarding status: [New/Existing/One-time]</htext>
    </hp>

    <hh3>Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Credit Card/Petty Cash/Check/ACH]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID/Reference: [ID/Reference]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt obtained: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax exempt purchase: [Yes/No]</htext>
    </hp>

    <hh3>Purchase Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Goods/Services purchased: [Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Purchase date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Business purpose: [Purpose]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expense category: [Category]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Department/Cost center: [Department/Cost Center]</htext>
    </hp>

    <hh3>Approval Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Requested by: [Employee Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Approved by: [Manager Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date of approval: [Date]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt image attached: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Reimbursable expense: [Yes/No]</htext>
    </hp>
    <hp>
      <htext>
        Notes: [Special handling instructions, quality assessment, etc.]
      </htext>
    </hp>
  </fragment>
)

export default smallVendorTemplate

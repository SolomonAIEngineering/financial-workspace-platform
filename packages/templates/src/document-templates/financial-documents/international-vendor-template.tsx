/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// International Vendor Payment Template
export const internationalVendorTemplate: any = (
  <fragment>
    <hh1>International Vendor Payment Record</hh1>
    <hp>
      Comprehensive documentation of payments to international vendors with
      additional fields for cross-border compliance, currency exchange, and
      international banking.
    </hp>

    <hh3>Vendor Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor name: [Vendor Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor ID/Account number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Country of operation: [Country]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor contact person: [Contact Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact email/phone: [Email/Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor tax ID/VAT number: [Tax ID/VAT]</htext>
    </hp>

    <hh3>Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount (foreign currency): [Amount] [Currency Code]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount (USD equivalent): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Exchange rate: [Rate]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Exchange rate source: [Source]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [SWIFT/Wire Transfer/International ACH]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID: [ID/Number]</htext>
    </hp>

    <hh3>International Banking Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Bank name: [Bank Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Bank address: [Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>SWIFT/BIC code: [Code]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>IBAN number: [IBAN]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Routing/Sort code: [Code]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Correspondent bank (if applicable): [Bank Name]</htext>
    </hp>

    <hh3>Order Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Purchase order number: [PO #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment status: [Paid in Full/Partial Payment]</htext>
    </hp>

    <hh3>International Compliance</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Withholding tax applied: [Yes/No - Rate%]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Import duties paid: [Yes/No - Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax treaty applied: [Yes/No - Details]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Required documentation complete: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Export compliance verified: [Yes/No]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Goods/Services purchased: [Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment terms: [Net 30/Upon Receipt/etc.]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date sent: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Authorized by: [Employee Name]</htext>
    </hp>
    <hp>
      <htext>
        Payment notes: [International shipping details, customs information,
        etc.]
      </htext>
    </hp>
  </fragment>
)

export default internationalVendorTemplate

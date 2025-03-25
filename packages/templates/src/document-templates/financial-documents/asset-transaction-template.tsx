/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Asset Transaction Template with enhanced details
export const assetTransactionTemplate: any = (
  <fragment>
    <hh1>Asset Transaction Record</hh1>
    <hp>
      Comprehensive documentation of business asset acquisitions and disposals
      for accurate financial record-keeping, tax reporting, and fixed asset
      management.
    </hp>

    <hh3>Asset Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Asset description: [Detailed Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Asset category:
        [Equipment/Vehicle/Property/Furniture/Technology/Intangible/Other]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Make/Model/Serial number: [Details]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Condition: [New/Used/Refurbished/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Asset tag/Inventory number: [Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Fixed asset account number: [Account #]</htext>
    </hp>

    <hh3>Transaction Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Transaction type: [Purchase/Sale/Trade-in/Disposal/Donation/Transfer]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Cash/Check/Credit Card/Loan/Lease/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction costs (fees, taxes, shipping): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total cost basis: $[Amount]</htext>
    </hp>

    <hh3>Counterparty Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Counterparty name: [Vendor/Buyer Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact person: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact information: [Email/Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Counterparty address: [Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Counterparty tax ID (if relevant): [Tax ID]</htext>
    </hp>

    <hh3>For Purchases</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Purchase order number: [PO #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Warranty information: [Terms/Expiration]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Insurance coverage: [Yes/No - Policy #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expected useful life: [Years/Months]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Business purpose: [Department/Use]</htext>
    </hp>

    <hh3>For Sales/Disposals</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Original purchase date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Original cost: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Book value at time of sale: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Accumulated depreciation: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Gain/Loss on sale: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Reason for disposal: [Obsolete/Damaged/Upgraded/Surplus/Other]
      </htext>
    </hp>

    <hh3>Accounting and Tax Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Depreciation method: [Straight-line/Accelerated/Section 179/Other]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax classification: [5-year/7-year/15-year/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Annual depreciation amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Tax implications: [Capital Gain/Ordinary Income/Deduction/Other]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Section 179 deduction taken: [Yes/No - Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Listed property (special tax rules): [Yes/No]</htext>
    </hp>

    <hh3>Documentation</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Title/Deed/Certificate location: [Location]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Purchase/Sale agreement filed: [Location/File name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt/Invoice filed: [Location/File name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Photos/Documentation: [Location/File name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Authorized by: [Name/Position]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hp>
      <htext>
        Asset depreciation/appreciation notes: [Maintenance history,
        improvements made, market value changes, impairment considerations,
        disposal plans, replacement schedule, etc.]
      </htext>
    </hp>
  </fragment>
)

export default assetTransactionTemplate

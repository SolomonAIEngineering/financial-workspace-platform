/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Strategic/Key Vendor Payment Template
export const strategicVendorTemplate: any = (
  <fragment>
    <hh1>Strategic Vendor Payment Record</hh1>
    <hp>
      Comprehensive payment documentation for high-value, strategic vendor
      relationships with additional fields for relationship management,
      performance metrics, and long-term contract evaluation.
    </hp>

    <hh3>Vendor Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor name: [Vendor Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor ID/Account number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Strategic category: [Critical/Preferred/Alliance]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account manager name: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Account manager contact: [Email/Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Relationship manager (internal): [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Relationship start date: [Date]</htext>
    </hp>

    <hh3>Contract Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Master contract number: [Contract #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract effective date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract expiration date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract type: [Fixed/Time & Materials/Retainer]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Annual contract value: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>SLA terms: [Brief Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Next contract review date: [Date]</htext>
    </hp>

    <hh3>Current Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Method]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID: [ID/Number]</htext>
    </hp>
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
      <htext>Payment date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment status: [Status]</htext>
    </hp>

    <hh3>Performance Metrics</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Current performance score: [Score/Rating]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Quality metrics: [Rating/Notes]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Delivery metrics: [Rating/Notes]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Cost performance: [Rating/Notes]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Service levels met: [Yes/No/Partial]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Issues/Incidents this period: [Count/Description]</htext>
    </hp>

    <hh3>Business Impact</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Strategic objectives supported: [Objectives]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Business units served: [Business Units]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Products/Services impacted: [Products/Services]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Risk assessment level: [Low/Medium/High]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Business continuity consideration: [Notes]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Goods/Services purchased: [Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Spend YTD with vendor: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Anticipated future spend: $[Amount/Quarter]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Next executive review meeting: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract negotiation start date: [Date]</htext>
    </hp>
    <hp>
      <htext>
        Relationship notes: [Strategic considerations, innovation opportunities,
        optimization potential]
      </htext>
    </hp>
  </fragment>
)

export default strategicVendorTemplate

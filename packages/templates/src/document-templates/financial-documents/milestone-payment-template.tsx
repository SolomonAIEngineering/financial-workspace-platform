/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Contract Milestone Payment Template
export const milestonePaymentTemplate: any = (
  <fragment>
    <hh1>Contract Milestone Payment Record</hh1>
    <hp>
      Specialized documentation for stage-based payments to vendors working on
      projects with defined milestones, deliverables, and contract terms.
    </hp>

    <hh3>Vendor Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor name: [Vendor Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor ID/Account number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Project manager/contact: [Contact Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact email/phone: [Email/Phone]</htext>
    </hp>

    <hh3>Project Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Project name/code: [Name/Code]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contract number: [Contract #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Project start date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Project end date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total contract value: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Current project status: [On Track/Delayed/Ahead]</htext>
    </hp>

    <hh3>Milestone Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Milestone number/name: [Number/Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Milestone description: [Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Deliverables required: [List of Deliverables]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Deliverables received and accepted: [Yes/No/Partial]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Quality assessment: [Rating/Notes]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Schedule performance: [On Time/Late/Early]</htext>
    </hp>

    <hh3>Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Milestone payment amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Percentage of total contract: [Percentage]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Holdback amount (if applicable): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Method]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment date: [Date]</htext>
    </hp>

    <hh3>Approval Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Milestone approved by: [Name/Position]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date of approval: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment authorized by: [Name/Position]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date of authorization: [Date]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Next milestone due: [Milestone Number/Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Next milestone due date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Next payment amount (estimated): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Change orders affecting this milestone: [CO Numbers]</htext>
    </hp>
    <hp>
      <htext>
        Payment notes: [Issues, risks, dependencies, quality concerns, etc.]
      </htext>
    </hp>
  </fragment>
)

export default milestonePaymentTemplate

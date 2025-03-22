/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Tax Payment Template with enhanced details
export const taxPaymentTemplate: any = (
  <fragment>
    <hh1>Tax Payment Record</hh1>
    <hp>
      Detailed documentation of tax payments to government agencies for
      compliance, record-keeping, and audit preparation purposes.
    </hp>

    <hh3>Business Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Business/Entity name: [Legal Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>DBA (if applicable): [DBA Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Federal EIN/Tax ID: [Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>State Tax ID(s): [Number(s)]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Business address: [Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Business entity type: [Sole Prop/LLC/S-Corp/C-Corp/Partnership/Other]
      </htext>
    </hp>

    <hh3>Tax Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Tax type: [Income/Sales/Payroll/Property/Excise/Use/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax authority: [IRS/State/Local/International]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax jurisdiction: [Federal/State Name/Local Authority]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Form number: [Form #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Period covered: [Quarter/Year/Month]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Period start date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Period end date: [Date]</htext>
    </hp>

    <hh3>Payment Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Amount paid: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Payment method: [EFTPS/Direct Debit/Check/Credit Card/Tax Software]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment frequency: [Annual/Quarterly/Monthly/Semi-weekly]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Due date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment status: [On-time/Late]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Penalties/Interest (if any): $[Amount]</htext>
    </hp>

    <hh3>Verification and Tracking</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Confirmation number: [Conf #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID: [ID]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tracking number: [Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Check number (if applicable): [Check #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment account: [Account Last 4 Digits]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment authorized by: [Name]</htext>
    </hp>

    <hh3>Filing Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Return/Form filed: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Filing method: [Electronic/Paper]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Filing date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Extension filed: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Extended due date (if applicable): [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax preparer: [Name/Firm]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Related estimated tax payments: $[Amount(s)]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax credits applied: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Refund expected: [Yes/No] - $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Documentation stored: [Location/File Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Record retention period: [Years]</htext>
    </hp>
    <hp>
      <htext>
        Notes for tax filing: [Special circumstances, payment plans, audit
        considerations, tax strategy adjustments, etc.]
      </htext>
    </hp>
  </fragment>
)

export default taxPaymentTemplate

/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Payroll Processing Template with enhanced details
export const payrollProcessingTemplate: any = (
  <fragment>
    <hh1>Payroll Processing Record</hh1>
    <hp>
      Comprehensive documentation of employee compensation, deductions, taxes,
      and benefits for accurate record-keeping and compliance.
    </hp>

    <hh3>Payroll Period Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Pay period: [Start Date - End Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Pay frequency: [Weekly/Bi-weekly/Semi-monthly/Monthly]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Pay date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment type: [Regular/Off-cycle/Bonus/Commission]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Number of employees paid: [Number]</htext>
    </hp>

    <hh3>Company Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Company name: [Company Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>EIN/Tax ID: [ID Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Company address: [Address]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>State unemployment ID: [ID Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>State withholding ID: [ID Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Workers' comp policy: [Policy Number]</htext>
    </hp>

    <hh3>Payroll Totals</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>
        Total hours worked: [Hours] (Regular: [Hours], Overtime: [Hours])
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total gross wages: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Regular earnings: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Overtime earnings: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Bonus/Commission payments: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>PTO/Vacation/Sick pay: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Reimbursements: $[Amount]</htext>
    </hp>

    <hh3>Tax Withholdings</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Federal income tax: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Social Security (FICA): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Medicare: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>State income tax: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Local/City taxes: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total tax withholdings: $[Amount]</htext>
    </hp>

    <hh3>Deductions and Benefits</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Health insurance: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Dental/Vision insurance: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Retirement contributions (401k/IRA): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>FSA/HSA contributions: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Life/Disability insurance: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Garnishments/Child support: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Other deductions: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total deductions: $[Amount]</htext>
    </hp>

    <hh3>Net Pay and Distribution</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Total net pay: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Direct Deposit/Check/Pay Card]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Bank account type: [Checking/Savings]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Number of direct deposits: [Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Number of checks issued: [Number]</htext>
    </hp>

    <hh3>Employer Taxes and Contributions</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Employer FICA match: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Federal unemployment (FUTA): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>State unemployment insurance: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Workers' compensation premium: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Employer benefit contributions: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total employer cost: $[Amount]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Processing Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payroll processor: [In-house/Provider Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payroll admin: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Approver: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Processing date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax deposit due date: [Date]</htext>
    </hp>
    <hp>
      <htext>
        Special adjustments: [Retroactive pay, corrections, pay increases,
        one-time bonuses, termination payouts, etc.]
      </htext>
    </hp>
  </fragment>
)

export default payrollProcessingTemplate

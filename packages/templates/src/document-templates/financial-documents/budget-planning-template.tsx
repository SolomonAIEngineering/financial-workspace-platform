/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Budget Planning Template with detailed sections
export const budgetPlanningTemplate: any = (
  <fragment>
    <hh1>Business Budget Plan</hh1>
    <hp>
      Comprehensive budget planning tool for small businesses to forecast income, 
      plan expenses, and set financial goals for upcoming periods.
    </hp>

    <hh3>Business Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Business name: [Business Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Budget period: [Month/Quarter/Year]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Budget start date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Budget end date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Prepared by: [Name/Position]</htext>
    </hp>

    <hh3>Revenue Projections</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Product/Service sales: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contracts/Retainers: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Consulting/Service fees: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Other income sources: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total projected revenue: $[Amount]</htext>
    </hp>

    <hh3>Fixed Expenses</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Rent/Mortgage: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Utilities: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Insurance premiums: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Loan payments: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Subscriptions/Software: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Employee salaries: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total fixed expenses: $[Amount]</htext>
    </hp>

    <hh3>Variable Expenses</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Inventory purchases: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Marketing/Advertising: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contractor payments: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Office supplies: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Travel expenses: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total variable expenses: $[Amount]</htext>
    </hp>

    <hh3>Planned Investments</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Equipment purchases: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Software/Technology: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Business expansion: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Professional development: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total planned investments: $[Amount]</htext>
    </hp>

    <hh3>Summary</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Total projected revenue: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total expenses (fixed + variable): $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total investments: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Projected cash flow: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Profit margin: [Percentage]%</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hp>
      <htext>
        Budget notes: [Assumptions, contingency plans, seasonal considerations, goals]
      </htext>
    </hp>
  </fragment>
)

export default budgetPlanningTemplate 
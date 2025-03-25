/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Cash Flow Projection Template with detailed sections
export const cashFlowProjectionTemplate: any = (
    <fragment>
        <hh1>Cash Flow Projection</hh1>
        <hp>
            Track expected cash inflows and outflows over a specific period to manage
            liquidity and plan for potential cash shortages or surpluses.
        </hp>

        <hh3>Projection Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business name: [Business Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Projection period: [Weekly/Monthly/Quarterly]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Start date: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>End date: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Prepared by: [Name/Position]</htext>
        </hp>

        <hh3>Beginning Cash Position</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Cash in primary account: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash in secondary accounts: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Petty cash: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total beginning cash: $[Amount]</htext>
        </hp>

        <hh3>Cash Inflows</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Cash sales: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Receivables collection: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Loan proceeds: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Other income: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total projected inflows: $[Amount]</htext>
        </hp>

        <hh3>Cash Outflows</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory purchases: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Payroll and benefits: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Rent and utilities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Loan/Debt payments: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Tax payments: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Vendor/Supplier payments: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Capital expenditures: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Owner withdrawals: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total projected outflows: $[Amount]</htext>
        </hp>

        <hh3>Net Cash Flow</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Beginning cash: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>+ Total inflows: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>- Total outflows: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>= Net cash flow: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Ending cash position: $[Amount]</htext>
        </hp>

        <hh3>Cash Flow Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Minimum cash threshold required: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash shortage periods: [Dates]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash excess periods: [Dates]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Potential funding needed: $[Amount]</htext>
        </hp>

        <element type={HorizontalRulePlugin.key}>
            <htext />
        </element>

        <hp>
            <htext>
                Contingency plans: [Describe strategies for managing potential cash shortages, including lines of credit, delayed vendor payments, accelerated receivables, etc.]
            </htext>
        </hp>
    </fragment>
)

export default cashFlowProjectionTemplate 
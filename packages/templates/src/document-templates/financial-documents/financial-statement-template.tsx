/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Financial Statement Template with detailed sections
export const financialStatementTemplate: any = (
    <fragment>
        <hh1>Financial Statement Preparation</hh1>
        <hp>
            Structured format for preparing and documenting key financial statements
            for small business reporting, tax preparation, and stakeholder communications.
        </hp>

        <hh3>Business Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business name: [Business Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Fiscal period: [Month/Quarter/Year]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Period start: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Period end: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Prepared by: [Name/Position]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Date prepared: [Date]</htext>
        </hp>

        <hh3>Income Statement (Profit & Loss)</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Product sales: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Service revenue: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Other revenue: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cost of Goods Sold (COGS): $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Direct materials: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Direct labor: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Manufacturing overhead: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Gross Profit: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Operating Expenses: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Salaries & wages: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Rent/Lease: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Utilities: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Marketing & advertising: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Insurance: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Office expenses: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Other expenses: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Operating Income: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Other Income/Expenses: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net Income Before Taxes: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Taxes: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net Income: $[Amount]</htext>
        </hp>

        <hh3>Balance Sheet</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Assets</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Current Assets: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Cash & equivalents: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Accounts receivable: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Inventory: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Prepaid expenses: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Fixed Assets: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Property & equipment: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Less: Accumulated depreciation: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Other Assets: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total Assets: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Liabilities</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Current Liabilities: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Accounts payable: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Short-term debt: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Accrued expenses: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Long-term Liabilities: $[Amount]</htext>
        </hp>
        <hp indent={3} listStyleType="square">
            <htext>Long-term debt: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total Liabilities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Equity</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Owner's equity/Capital: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Retained earnings: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total Equity: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total Liabilities & Equity: $[Amount]</htext>
        </hp>

        <hh3>Cash Flow Statement</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Net Income: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Operating Activities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Investing Activities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Financing Activities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net Cash Flow: $[Amount]</htext>
        </hp>

        <element type={HorizontalRulePlugin.key}>
            <htext />
        </element>

        <hp>
            <htext>
                Financial statement notes: [Include explanations for unusual items, accounting
                methods used, significant events affecting financial performance, and any
                off-balance sheet arrangements]
            </htext>
        </hp>
    </fragment>
)

export default financialStatementTemplate 
/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Profit & Loss Analysis Template with detailed sections
export const profitLossAnalysisTemplate: any = (
    <fragment>
        <hh1>Profit & Loss Analysis</hh1>
        <hp>
            Detailed analysis of business profitability for a specific period, identifying
            revenue streams, cost centers, and opportunities for margin improvement.
        </hp>

        <hh3>Analysis Overview</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business name: [Business Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Analysis period: [Start Date - End Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Prepared by: [Name/Position]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Date prepared: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Comparison period: [Previous Period]</htext>
        </hp>

        <hh3>Revenue Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total revenue: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue by category:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Category 1]: $[Amount] ([Percentage]% of total)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Category 2]: $[Amount] ([Percentage]% of total)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Category 3]: $[Amount] ([Percentage]% of total)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue growth/decline: [+/-][Percentage]% from previous period</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Fastest growing revenue stream: [Category] ([Percentage]% growth)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Most declining revenue stream: [Category] ([Percentage]% decline)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue variance from budget: [+/-][Percentage]%</htext>
        </hp>

        <hh3>Cost of Goods Sold (COGS) Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total COGS: $[Amount] ([Percentage]% of revenue)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>COGS by category:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Direct materials: $[Amount] ([Percentage]% of COGS)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Direct labor: $[Amount] ([Percentage]% of COGS)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Manufacturing overhead: $[Amount] ([Percentage]% of COGS)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Shipping/Freight: $[Amount] ([Percentage]% of COGS)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>COGS as percentage of revenue vs. previous period: [+/-][Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>COGS variance from budget: [+/-][Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Areas of cost increase: [Categories and reasons]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Areas of cost savings: [Categories and reasons]</htext>
        </hp>

        <hh3>Gross Profit Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total gross profit: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Gross profit margin: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Gross profit change: [+/-][Percentage]% from previous period</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Gross profit by product/service:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Product/Service 1]: $[Amount] ([Percentage]% margin)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Product/Service 2]: $[Amount] ([Percentage]% margin)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Product/Service 3]: $[Amount] ([Percentage]% margin)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Highest margin product/service: [Product/Service] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Lowest margin product/service: [Product/Service] ([Percentage]%)</htext>
        </hp>

        <hh3>Operating Expenses Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total operating expenses: $[Amount] ([Percentage]% of revenue)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Expense breakdown:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Salaries & benefits: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Rent & utilities: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Marketing & advertising: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Technology & software: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Office expenses: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Professional services: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Travel & entertainment: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Insurance: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Other expenses: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Fixed vs. variable expenses: [Percentage]% fixed / [Percentage]% variable</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Operating expense ratio: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Largest expense increases: [Categories and percentages]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Expense reduction opportunities: [Description]</htext>
        </hp>

        <hh3>Net Profit Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Net profit before tax: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net profit margin before tax: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Tax expense: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net profit after tax: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net profit margin after tax: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net profit change: [+/-][Percentage]% from previous period</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net profit variance from budget: [+/-][Percentage]%</htext>
        </hp>

        <hh3>Profitability Ratios</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Return on sales (ROS): [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Return on assets (ROA): [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Return on equity (ROE): [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>EBITDA: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>EBITDA margin: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Break-even point: $[Amount]</htext>
        </hp>

        <hh3>Profit Improvement Strategy</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue growth opportunities: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Pricing strategy recommendations: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cost reduction targets: [List with amounts]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Product/service mix optimization: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Resource allocation recommendations: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Target profit margin for next period: [Percentage]%</htext>
        </hp>

        <element type={HorizontalRulePlugin.key}>
            <htext />
        </element>

        <hp>
            <htext>
                Profit analysis summary: [Key insights about profitability trends, critical issues,
                and specific action items to improve financial performance]
            </htext>
        </hp>
    </fragment>
)

export default profitLossAnalysisTemplate 
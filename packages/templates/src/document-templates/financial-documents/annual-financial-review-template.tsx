/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Annual Financial Review Template with detailed sections
export const annualFinancialReviewTemplate: any = (
    <fragment>
        <hh1>Annual Financial Review</hh1>
        <hp>
            Comprehensive annual financial performance assessment for small businesses to
            evaluate past performance, identify trends, and plan for the upcoming year.
        </hp>

        <hh3>Business Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business name: [Business Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Fiscal year reviewed: [Year]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Review period: [Start Date - End Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Prepared by: [Name/Position]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Review date: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Participants: [Names/Positions]</htext>
        </hp>

        <hh3>Financial Performance Summary</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total revenue: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue comparison to previous year: [+/-] [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue comparison to budget: [+/-] [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Gross profit: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net income: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>EBITDA: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash flow from operations: $[Amount]</htext>
        </hp>

        <hh3>Revenue Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue by product/service line:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Product/Service 1]: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Product/Service 2]: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Product/Service 3]: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue by customer segment:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Segment 1]: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Segment 2]: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Top 5 customers by revenue:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Customer 1]: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Seasonal revenue trends: [Description]</htext>
        </hp>

        <hh3>Expense Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total expenses: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Expense comparison to previous year: [+/-] [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Expense comparison to budget: [+/-] [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Major expense categories:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Cost of goods sold: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Payroll and benefits: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Rent/Facilities: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Marketing/Advertising: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Technology/Software: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Professional services: $[Amount] ([Percentage]%)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Expense variances exceeding [Percentage]%: [List/Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cost-cutting opportunities identified: [List]</htext>
        </hp>

        <hh3>Balance Sheet Review</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total assets: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total liabilities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total equity: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Current ratio: [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Quick ratio: [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Debt-to-equity ratio: [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Accounts receivable turnover: [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory turnover: [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Notable changes in asset composition: [Description]</htext>
        </hp>

        <hh3>Cash Flow Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Beginning cash balance: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash from operations: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash from investing activities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash from financing activities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Ending cash balance: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash conversion cycle: [Days]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash flow adequacy ratio: [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Free cash flow: $[Amount]</htext>
        </hp>

        <hh3>Key Performance Indicators</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Return on investment (ROI): [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Return on equity (ROE): [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Return on assets (ROA): [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Break-even point: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Customer acquisition cost: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Customer lifetime value: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Industry-specific KPIs: [List with values]</htext>
        </hp>

        <hh3>Strategic Assessment</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Key financial achievements: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Major financial challenges: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Growth areas identified: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Competitive financial positioning: [Assessment]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Market trends impact: [Description]</htext>
        </hp>

        <hh3>Action Items for Next Year</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Financial targets: [List with metrics]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cost control initiatives: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue enhancement strategies: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cash flow improvement actions: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Capital allocation plan: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Financial process improvements: [List]</htext>
        </hp>

        <element type={HorizontalRulePlugin.key}>
            <htext />
        </element>

        <hp>
            <htext>
                Executive summary: [Concise overview of financial performance, key insights,
                and critical actions for the upcoming year]
            </htext>
        </hp>
    </fragment>
)

export default annualFinancialReviewTemplate
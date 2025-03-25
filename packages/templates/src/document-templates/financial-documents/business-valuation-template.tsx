/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Business Valuation Template with detailed sections
export const businessValuationTemplate: any = (
    <fragment>
        <hh1>Business Valuation Documentation</hh1>
        <hp>
            Comprehensive business valuation framework for small businesses to document
            worth for sale preparation, partnership agreements, or financing applications.
        </hp>

        <hh3>Business Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business name: [Business Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business type: [LLC/S-Corp/C-Corp/Sole Proprietorship/Partnership]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Industry: [Industry]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Location(s): [Address(es)]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Years in operation: [Years]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Number of employees: [Number]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Valuation date: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Valuation purpose: [Sale/Estate Planning/Financing/Partnership/Other]</htext>
        </hp>

        <hh3>Financial Performance Summary</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Annual revenue (last 3 years):</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Year 1 ([Year]): $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Year 2 ([Year]): $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Year 3 ([Year]): $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Annual EBITDA (last 3 years):</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Year 1 ([Year]): $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Year 2 ([Year]): $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Year 3 ([Year]): $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net profit margin: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Revenue growth rate: [Percentage]%</htext>
        </hp>

        <hh3>Asset Valuation</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Tangible Assets:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Cash and equivalents: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Accounts receivable: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Inventory: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Equipment and fixtures: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Real estate: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Vehicles: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Other tangible assets: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total tangible assets: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Intangible Assets:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Intellectual property: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Brand value: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Customer relationships: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Goodwill: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Other intangible assets: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total intangible assets: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Liabilities:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Short-term debt: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Long-term debt: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Accounts payable: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Other liabilities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total liabilities: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net asset value: $[Amount]</htext>
        </hp>

        <hh3>Valuation Methods</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Asset-Based Valuation: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Income-Based Valuations:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Multiple of EBITDA ([x] multiple): $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Multiple of revenue ([x] multiple): $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Discounted cash flow (DCF): $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Market-Based Valuations:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Comparable company transactions: $[Amount]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Industry rule of thumb: $[Amount]</htext>
        </hp>

        <hh3>Valuation Adjustments</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Owner's compensation adjustment: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Non-recurring expenses/income: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Related party transactions: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory adjustments: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Other adjustments: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Total adjustments: $[Amount]</htext>
        </hp>

        <hh3>Final Valuation Summary</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Concluded business value range: $[Min] - $[Max]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Most likely value: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Primary valuation method used: [Method]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Key value drivers: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Key risk factors: [List]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Valuation professional: [Name/Firm]</htext>
        </hp>

        <element type={HorizontalRulePlugin.key}>
            <htext />
        </element>

        <hp>
            <htext>
                Valuation notes: [Methodology details, key assumptions, market conditions,
                growth projections, and any limitations of the valuation approach]
            </htext>
        </hp>
    </fragment>
)

export default businessValuationTemplate 
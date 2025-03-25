/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Inventory Management Template with detailed sections
export const inventoryManagementTemplate: any = (
    <fragment>
        <hh1>Inventory Management Documentation</hh1>
        <hp>
            Comprehensive inventory tracking and analysis framework for small businesses
            to optimize stock levels, reduce carrying costs, and prevent stockouts.
        </hp>

        <hh3>Business Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business name: [Business Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory period: [Month/Quarter/Year]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Report date: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Prepared by: [Name/Position]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory location(s): [Locations]</htext>
        </hp>

        <hh3>Inventory Summary</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Total inventory value: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Number of unique SKUs: [Number]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory value change: [+/-][Percentage]% from previous period</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory by category:</htext>
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
            <htext>Inventory valuation method: [FIFO/LIFO/Weighted Average/Other]</htext>
        </hp>

        <hh3>Inventory Performance Metrics</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory turnover ratio: [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Days inventory outstanding (DIO): [Days]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Gross margin return on investment (GMROI): [Ratio]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Carrying cost as percentage of inventory value: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Service level (order fill rate): [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Stockout rate: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Perfect order rate: [Percentage]%</htext>
        </hp>

        <hh3>Inventory Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>ABC Analysis:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>A Items (high value): [Number] SKUs / $[Amount] / [Percentage]% of value</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>B Items (medium value): [Number] SKUs / $[Amount] / [Percentage]% of value</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>C Items (low value): [Number] SKUs / $[Amount] / [Percentage]% of value</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Slow-moving inventory: [Number] SKUs / $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Obsolete inventory: [Number] SKUs / $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Dead stock: [Number] SKUs / $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Fast-moving items: [List of top 5 items]</htext>
        </hp>

        <hh3>Inventory Issues</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Current stockouts: [List of items]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Items at risk of stockout: [List of items]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Overstocked items: [List of items]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Items with quality issues: [List of items]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Damaged/expired inventory: [List of items] / $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory discrepancies: [Description of variances]</htext>
        </hp>

        <hh3>Inventory Control Measures</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Reorder points updated: [Yes/No - Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Safety stock levels reviewed: [Yes/No - Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Cycle count schedule: [Frequency/Next count date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Full physical inventory date: [Last date/Next date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory accuracy rate: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Vendor performance review: [Complete/Pending]</htext>
        </hp>

        <hh3>Supplier & Procurement Analysis</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Key suppliers by volume:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Supplier 1]: $[Amount] ([Percentage]% of purchases)</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Supplier 2]: $[Amount] ([Percentage]% of purchases)</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Average lead time by supplier:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Supplier 1]: [Days] days</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>[Supplier 2]: [Days] days</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Order frequency: [Daily/Weekly/Monthly/As needed]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Average order size: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Supplier reliability rating: [Rating/Scale]</htext>
        </hp>

        <hh3>Inventory Optimization Strategies</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Recommended stock adjustments:</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Increase stock: [List of items]</htext>
        </hp>
        <hp indent={2} listStyleType="circle">
            <htext>Decrease stock: [List of items]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Disposal/Liquidation plan: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Seasonal stocking strategy: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Vendor-managed inventory opportunities: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Inventory storage optimization: [Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Technology improvements needed: [Description]</htext>
        </hp>

        <element type={HorizontalRulePlugin.key}>
            <htext />
        </element>

        <hp>
            <htext>
                Inventory management action plan: [Specific steps to optimize inventory levels,
                reduce carrying costs, prevent stockouts, and improve overall inventory management]
            </htext>
        </hp>
    </fragment>
)

export default inventoryManagementTemplate 
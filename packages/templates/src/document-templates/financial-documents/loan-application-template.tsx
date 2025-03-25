/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Loan Application Template with detailed sections
export const loanApplicationTemplate: any = (
    <fragment>
        <hh1>Business Loan Application</hh1>
        <hp>
            Comprehensive documentation for small business loan applications to track
            requirements, terms, and follow-up actions when seeking financing.
        </hp>

        <hh3>Business Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business legal name: [Business Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>DBA (if applicable): [DBA Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business address: [Address]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business phone: [Phone Number]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Tax ID/EIN: [Tax ID]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business structure: [Sole Proprietorship/LLC/Corporation/Partnership]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Years in business: [Number]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Number of employees: [Number]</htext>
        </hp>

        <hh3>Loan Request Details</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Loan amount requested: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Loan type: [Term Loan/Line of Credit/SBA Loan/Equipment Loan/Other]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Purpose of loan: [Purpose]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Desired term length: [Years/Months]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Collateral available: [Yes/No - Description]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>How quickly funds are needed: [Timeframe]</htext>
        </hp>

        <hh3>Financial Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Annual business revenue: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Net income (last fiscal year): $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Current outstanding debt: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Monthly debt payments: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business credit score (if known): [Score]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Current bank account balance: $[Amount]</htext>
        </hp>

        <hh3>Owner Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Owner name(s): [Name(s)]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Ownership percentage: [Percentage]%</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Personal credit score: [Score]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>SSN (last 4 digits): xxx-xx-[####]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Personal annual income: $[Amount]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Personal guaranty offered: [Yes/No]</htext>
        </hp>

        <hh3>Required Documentation Checklist</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Business financial statements: [Submitted/Pending]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Personal financial statements: [Submitted/Pending]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business tax returns (last 2-3 years): [Submitted/Pending]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Personal tax returns (last 2 years): [Submitted/Pending]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business plan or projection: [Submitted/Pending]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Business licenses/registrations: [Submitted/Pending]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Collateral documentation: [Submitted/Pending]</htext>
        </hp>

        <hh3>Lender Information</hh3>
        <hp indent={1} listStyleType="disc">
            <htext>Lender name: [Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Lender contact: [Name]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Contact information: [Email/Phone]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Application status: [Preparing/Submitted/Under Review/Approved/Declined]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Application date: [Date]</htext>
        </hp>
        <hp indent={1} listStyleType="disc">
            <htext>Application ID/reference: [ID]</htext>
        </hp>

        <element type={HorizontalRulePlugin.key}>
            <htext />
        </element>

        <hp>
            <htext>
                Follow-up notes: [Document communications with lender, additional requirements, timeline, and next steps]
            </htext>
        </hp>
    </fragment>
)

export default loanApplicationTemplate 
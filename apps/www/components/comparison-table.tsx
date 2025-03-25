'use client'

import { useState, Fragment } from 'react'

export default function ComparisonTable() {
  const [annual, setAnnual] = useState<boolean>(true)

  // Define plan features by category
  const categories = [
    {
      name: 'Financial Reporting',
      features: [
        { name: 'Income Statement', free: true, business: true, team: true, enterprise: true },
        { name: 'Balance Sheet', free: true, business: true, team: true, enterprise: true },
        { name: 'Cash Flow Statement', free: false, business: true, team: true, enterprise: true },
        { name: 'Financial Ratios Analysis', free: false, business: false, team: true, enterprise: true },
        { name: 'Custom Financial Reports', free: false, business: false, team: true, enterprise: true },
        { name: 'Multi-Entity Consolidation', free: false, business: false, team: false, enterprise: true },
      ]
    },
    {
      name: 'Financial AI Assistants',
      features: [
        { name: 'Basic Financial Assistant', free: true, business: true, team: true, enterprise: true },
        { name: 'Transaction Categorization AI', free: true, business: true, team: true, enterprise: true },
        { name: 'Financial Forecasting AI', free: false, business: true, team: true, enterprise: true },
        { name: 'Cash Flow Optimization AI', free: false, business: false, team: true, enterprise: true },
        { name: 'Tax Planning AI', free: false, business: false, team: true, enterprise: true },
        { name: 'Investment Analysis AI', free: false, business: false, team: false, enterprise: true },
      ]
    },
    {
      name: 'Integrations',
      features: [
        { name: 'Bank Connections', free: '2', business: '5', team: '15', enterprise: 'Unlimited' },
        { name: 'Payment Processors', free: '1', business: '3', team: '10', enterprise: 'Unlimited' },
        { name: 'Accounting Software', free: false, business: true, team: true, enterprise: true },
        { name: 'ERP Systems', free: false, business: false, team: true, enterprise: true },
        { name: 'Custom API Integrations', free: false, business: false, team: false, enterprise: true },
      ]
    },
    {
      name: 'Team Collaboration',
      features: [
        { name: 'Team Members', free: '1', business: '3', team: '10', enterprise: 'Unlimited' },
        { name: 'Role-Based Access Control', free: false, business: true, team: true, enterprise: true },
        { name: 'Activity Logs', free: false, business: true, team: true, enterprise: true },
        { name: 'Comment & Annotations', free: false, business: true, team: true, enterprise: true },
        { name: 'Approval Workflows', free: false, business: false, team: true, enterprise: true },
        { name: 'Audit Trails', free: false, business: false, team: true, enterprise: true },
      ]
    },
    {
      name: 'Data Security',
      features: [
        { name: 'Data Encryption', free: true, business: true, team: true, enterprise: true },
        { name: 'Two-Factor Authentication', free: true, business: true, team: true, enterprise: true },
        { name: 'SSO Integration', free: false, business: false, team: true, enterprise: true },
        { name: 'Custom Security Policies', free: false, business: false, team: false, enterprise: true },
        { name: 'GDPR Compliance Tools', free: false, business: false, team: true, enterprise: true },
      ]
    },
    {
      name: 'Support',
      features: [
        { name: 'Community Support', free: true, business: true, team: true, enterprise: true },
        { name: 'Email Support', free: false, business: true, team: true, enterprise: true },
        { name: 'Priority Support', free: false, business: false, team: true, enterprise: true },
        { name: 'Dedicated Account Manager', free: false, business: false, team: false, enterprise: true },
        { name: 'Custom Training', free: false, business: false, team: false, enterprise: true },
      ]
    },
  ]

  return (
    <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          {/* Table header */}
          <thead>
            <tr className="border-b border-slate-700">
              <th className="py-4 pr-4 text-left font-medium text-slate-50">Features</th>
              <th className="px-4 py-4 text-center font-medium text-slate-50">
                <div className="bg-linear-to-r inline-block from-indigo-500 to-indigo-300 bg-clip-text text-transparent">Free</div>
                <div className="mb-1 text-lg font-semibold text-slate-50">$0</div>
              </th>
              <th className="px-4 py-4 text-center font-medium text-slate-50">
                <div className="bg-linear-to-r inline-block from-purple-500 to-purple-300 bg-clip-text text-transparent">Small Business</div>
                <div className="mb-1">
                  <span className="text-lg font-semibold text-slate-50">${annual ? '29' : '39'}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>
              </th>
              <th className="px-4 py-4 text-center font-medium text-slate-50">
                <div className="bg-linear-to-r inline-block from-pink-500 to-pink-300 bg-clip-text text-transparent">Financial Team</div>
                <div className="mb-1">
                  <span className="text-lg font-semibold text-slate-50">${annual ? '59' : '69'}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>
              </th>
              <th className="px-4 py-4 text-center font-medium text-slate-50">
                <div className="bg-linear-to-r inline-block from-teal-500 to-teal-300 bg-clip-text text-transparent">Enterprise Finance</div>
                <div className="mb-1">
                  <span className="text-lg font-semibold text-slate-50">${annual ? '99' : '119'}</span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>
              </th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody>
            {categories.map((category, categoryIndex) => (
              <Fragment key={`category-${categoryIndex}`}>
                <tr className="border-b border-slate-700">
                  <td colSpan={5} className="py-4 font-semibold text-slate-50">
                    {category.name}
                  </td>
                </tr>
                {category.features.map((feature, featureIndex) => (
                  <tr
                    key={`feature-${categoryIndex}-${featureIndex}`}
                    className={featureIndex === category.features.length - 1 ? '' : 'border-b border-slate-800'}
                  >
                    <td className="py-3 pr-4 text-left text-slate-400">{feature.name}</td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {renderFeatureValue(feature.free)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {renderFeatureValue(feature.business)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {renderFeatureValue(feature.team)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">
                      {renderFeatureValue(feature.enterprise)}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Toggle annual/monthly */}
      <div className="mb-12 mt-8 flex justify-center">
        <div className="inline-flex items-center whitespace-nowrap">
          <div className="mr-2 text-sm font-medium text-slate-500">
            Monthly
          </div>
          <div className="relative">
            <input
              type="checkbox"
              id="table-toggle"
              className="peer sr-only"
              checked={annual}
              onChange={() => setAnnual(!annual)}
            />
            <label
              htmlFor="table-toggle"
              className="before:shadow-xs relative flex h-6 w-11 cursor-pointer items-center rounded-full bg-slate-400 px-0.5 outline-slate-400 transition-colors before:h-5 before:w-5 before:rounded-full before:bg-white before:transition-transform before:duration-150 peer-checked:bg-purple-500 peer-checked:before:translate-x-full peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gray-400 peer-focus-visible:peer-checked:outline-purple-500"
            >
              <span className="sr-only">Pay Yearly</span>
            </label>
          </div>
          <div className="ml-2 text-sm font-medium text-slate-500">
            Yearly <span className="text-teal-500">(-20%)</span>
          </div>
        </div>
      </div>
      
      {/* CTA buttons */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-center">
          <div className="mb-2 text-lg font-semibold text-slate-200">Free</div>
          <p className="mb-4 text-sm text-slate-500">Get started with essential financial tools</p>
          <a
            className="btn-sm w-full bg-slate-700 text-slate-300 hover:bg-slate-600"
            href="#0"
          >
            Sign Up Free
          </a>
        </div>
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-5 text-center">
          <div className="mb-2 text-lg font-semibold text-purple-300">Small Business</div>
          <p className="mb-4 text-sm text-slate-500">Perfect for startups and small businesses</p>
          <a
            className="btn-sm bg-linear-to-r w-full from-purple-500 to-purple-400 text-white hover:to-purple-500"
            href="#0"
          >
            Start Trial
          </a>
        </div>
        <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 p-5 text-center">
          <div className="mb-2 text-lg font-semibold text-pink-300">Financial Team</div>
          <p className="mb-4 text-sm text-slate-500">For growing finance teams and departments</p>
          <a
            className="btn-sm bg-linear-to-r w-full from-pink-500 to-pink-400 text-white hover:to-pink-500"
            href="#0"
          >
            Start Trial
          </a>
        </div>
        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-5 text-center">
          <div className="mb-2 text-lg font-semibold text-teal-300">Enterprise Finance</div>
          <p className="mb-4 text-sm text-slate-500">For large organizations with complex needs</p>
          <a
            className="btn-sm bg-linear-to-r w-full from-teal-500 to-teal-400 text-white hover:to-teal-500"
            href="#0"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </div>
  )
}

// Helper function to render feature values
function renderFeatureValue(value: boolean | string | number) {
  if (value === true) {
    return (
      <svg className="mx-auto h-4 w-4 fill-purple-500" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
      </svg>
    )
  } else if (value === false) {
    return <span className="text-slate-700">—</span>
  } else {
    return <span>{value}</span>
  }
}

'use client'

import Image from 'next/image'
// Use existing images as placeholders
import accountingImg from '@/public/images/feature-image-01.png'
import consultingImg from '@/public/images/feature-image-02.png'
import retailImg from '@/public/images/feature-image-03.png'
import techImg from '@/public/images/feature-image-04.png'
import { useState } from 'react'

export default function IndustryUseCases() {
  const [activeTab, setActiveTab] = useState<string>('accounting')

  const industries = [
    {
      id: 'accounting',
      name: 'Accounting Firms',
      description: 'Streamline client financial management with automated bookkeeping, document organization, and specialized reporting templates. Reduce manual data entry by up to 75% and improve client service quality.',
      features: [
        'Multi-client financial dashboard',
        'Tax preparation automation',
        'Client document management',
        'Reconciliation tools',
        'Professional reporting templates'
      ],
      recommendedPlan: 'Financial Team',
      image: accountingImg
    },
    {
      id: 'consulting',
      name: 'Financial Consultants',
      description: 'Deliver data-driven insights to your clients with powerful financial modeling and visualization tools. Create compelling presentations that demonstrate the value of your advisory services.',
      features: [
        'Scenario modeling & simulation',
        'Performance benchmarking',
        'Investment analysis tools',
        'Client presentation templates',
        'Strategy implementation tracking'
      ],
      recommendedPlan: 'Financial Team',
      image: consultingImg
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      description: 'Manage inventory costs, track sales performance, and optimize cash flow for your retail operations. Integrate with popular POS systems and e-commerce platforms for seamless financial management.',
      features: [
        'Inventory cost tracking',
        'Sales channel analytics',
        'Seasonal forecasting',
        'Cash flow optimization',
        'Vendor payment management'
      ],
      recommendedPlan: 'Small Business',
      image: retailImg
    },
    {
      id: 'tech',
      name: 'Tech Startups',
      description: 'Monitor burn rate, track investor metrics, and manage fundraising activities with tools designed for high-growth technology companies. Make data-driven decisions to extend your runway.',
      features: [
        'Burn rate monitoring',
        'Investor metrics dashboard',
        'Fundraising management',
        'Growth modeling',
        'R&D expense tracking'
      ],
      recommendedPlan: 'Small Business',
      image: techImg
    }
  ]

  const activeIndustry = industries.find(industry => industry.id === activeTab) || industries[0]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="border-t border-slate-800 py-12 md:py-20">
        <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
          <h2 className="h3 mb-4 text-slate-200">Industry-Tailored Financial Solutions</h2>
          <p className="text-slate-400">
            Our platform adapts to your specific industry needs with specialized features and workflows
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="border-b border-slate-800">
            <ul className="-mb-px flex flex-wrap text-center text-sm font-medium">
              {industries.map((industry) => (
                <li key={industry.id} className="mr-2">
                  <button
                    className={`inline-block rounded-t-lg px-5 py-2.5 hover:text-purple-400 ${activeTab === industry.id
                      ? 'border-b-2 border-purple-500 text-purple-300'
                      : 'border-transparent text-slate-400'
                      }`}
                    onClick={() => setActiveTab(industry.id)}
                  >
                    {industry.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tab content */}
        <div className="grid items-center gap-8 md:grid-cols-2">
          {/* Image */}
          <div className="order-1 md:order-none">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={activeIndustry.image}
                width={540}
                height={303}
                alt={activeIndustry.name}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 to-slate-900/20" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="mb-1 text-sm font-semibold text-purple-300">
                  Recommended: {activeIndustry.recommendedPlan}
                </div>
                <div className="text-lg font-semibold text-white">
                  {activeIndustry.name}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="mb-4 text-xl font-semibold text-slate-100">
              {activeIndustry.name} Solutions
            </div>
            <p className="mb-6 text-slate-400">
              {activeIndustry.description}
            </p>
            <ul className="space-y-3">
              {activeIndustry.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="mr-3 mt-1 h-4 w-4 shrink-0 fill-purple-500"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28.28 3.989 6.575 1.695 4.28A1 1 0 0 0 .28 5.695l3 3a1 1 0 0 0 1.414 0l7-7A1 1 0 0 0 10.28.28Z" />
                  </svg>
                  <span className="text-slate-400">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                className="btn-sm bg-linear-to-r from-purple-500 to-purple-400 text-white hover:to-purple-500"
                href="#0"
              >
                Learn More About {activeIndustry.name} Solutions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

export default function PlansSelector({ onPlanChange }: { onPlanChange: (plan: string) => void }) {
  const [selectedPlan, setSelectedPlan] = useState<string>('business')
  
  const handlePlanChange = (plan: string) => {
    setSelectedPlan(plan)
    onPlanChange(plan)
  }

  return (
    <div className="mx-auto mb-8 max-w-3xl">
      <div className="bg-slate-800/30 mb-6 rounded-lg p-1">
        <div className="grid grid-cols-4 gap-1">
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
              selectedPlan === 'startup' 
                ? 'bg-slate-700 text-slate-100' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => handlePlanChange('startup')}
          >
            Startup
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
              selectedPlan === 'business' 
                ? 'bg-slate-700 text-slate-100' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => handlePlanChange('business')}
          >
            Small Business
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
              selectedPlan === 'team' 
                ? 'bg-slate-700 text-slate-100' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => handlePlanChange('team')}
          >
            Finance Team
          </button>
          <button
            className={`rounded px-4 py-2 text-sm font-medium transition duration-150 ease-in-out ${
              selectedPlan === 'enterprise' 
                ? 'bg-slate-700 text-slate-100' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => handlePlanChange('enterprise')}
          >
            Enterprise
          </button>
        </div>
      </div>
      
      {/* Plan descriptions */}
      <div className="text-center">
        {selectedPlan === 'startup' && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-100">For Early-Stage Ventures</h3>
            <p className="text-slate-400">
              Perfect for startups and solo entrepreneurs managing their initial finances. 
              Basic tools to help you track expenses, income, and financial milestones.
            </p>
          </div>
        )}
        {selectedPlan === 'business' && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-100">For Growing Businesses</h3>
            <p className="text-slate-400">
              Ideal for small businesses with established operations. 
              Tools for bookkeeping automation, tax preparation, and basic financial forecasting.
            </p>
          </div>
        )}
        {selectedPlan === 'team' && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-100">For Financial Departments</h3>
            <p className="text-slate-400">
              Built for established companies with dedicated finance teams.
              Advanced reporting, multi-user access, and comprehensive financial analytics.
            </p>
          </div>
        )}
        {selectedPlan === 'enterprise' && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-100">For Complex Organizations</h3>
            <p className="text-slate-400">
              Tailored for large enterprises with complex financial operations.
              Custom integrations, enterprise-grade security, and dedicated support team.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

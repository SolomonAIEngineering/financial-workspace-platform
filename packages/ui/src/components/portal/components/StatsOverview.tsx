import React from 'react'

interface StatsOverviewProps {
  stats: Array<{ id: number; name: string; value: string | number }>
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => (
  <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-3">
    {stats.map((stat) => (
      <div key={stat.id} className="flex flex-col bg-gray-400/5 p-8">
        <dt className="text-foreground/3 text-sm font-semibold leading-6">
          {stat.name}
        </dt>
        <dd className="text-foreground order-first text-3xl font-semibold tracking-tight">
          {stat.value}
        </dd>
      </div>
    ))}
  </dl>
)

import React from 'react'

type StatCardProps = {
  label: string
  value?: number | string | null
  /** Optional URL to drill into metric details */
  detailUrl?: string
}

function formatValue(value: number | string) {
  if (typeof value === 'number') {
    if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`
    return String(value)
  }
  return String(value)
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, detailUrl }) => {
  const hasValue = value !== null && value !== undefined && value !== ''

  const content = (
    <>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">
        {hasValue ? formatValue(value as number | string) : <span className="text-sm text-muted">No data</span>}
      </div>
    </>
  )

  if (detailUrl) {
    return (
      <a
        href={detailUrl}
        className="block p-3 border rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2"
        aria-label={`${label} details`}
      >
        {content}
      </a>
    )
  }

  return <div className="p-3 border rounded-md shadow-sm bg-white">{content}</div>
}

export default StatCard

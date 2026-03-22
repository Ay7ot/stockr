import type { ReactNode } from 'react'
import { formatInteger } from '@/lib/format-numbers'

interface KPICardProps {
  label: string
  value: string | number | ReactNode
  color: string
  colorLight: string
  icon: ReactNode
  delta?: {
    value: string
    trend: 'up' | 'down'
  }
  period?: string
  sparkline?: number[]
}

export function KPICard({
  label,
  value,
  color,
  colorLight,
  icon,
  delta,
  period,
  sparkline,
}: KPICardProps) {
  const generateSparklinePath = (data: number[]) => {
    if (!data.length) return ''
    const width = 200
    const height = 36
    const max = Math.max(...data)
    const step = width / (data.length - 1)

    const points = data.map((val, i) => {
      const x = i * step
      const y = height - (val / max) * (height - 4)
      return `${x},${y}`
    })

    return points.join(' ')
  }

  return (
    <div
      className="kpi-card"
      style={
        {
          '--c': color,
          '--cb': colorLight,
        } as React.CSSProperties
      }
    >
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon-wrap">{icon}</div>
      </div>
      <div className="kpi-value">
        {typeof value === 'number' ? formatInteger(value) : value}
      </div>
      {(delta || period) && (
        <div className="kpi-footer">
          {delta && (
            <span className={`delta ${delta.trend}`}>
              {delta.trend === 'up' ? '↑' : '↓'} {delta.value}
            </span>
          )}
          {period && <span className="kpi-period">{period}</span>}
        </div>
      )}
      {sparkline && sparkline.length > 0 && (
        <div className="sparkline">
          <svg
            className="spark-svg"
            viewBox="0 0 200 36"
            preserveAspectRatio="none"
          >
            <polyline
              points={generateSparklinePath(sparkline)}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={`${generateSparklinePath(sparkline)} 200,36 0,36`}
              fill={`${color}14`}
              stroke="none"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

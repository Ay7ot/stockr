import { formatInteger } from '@/lib/format-numbers'

interface MonthlyChartProps {
  data: {
    month: string
    revenue: number
    units: number
  }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const maxUnits = Math.max(...data.map((d) => d.units))

  return (
    <div className="card chart-card">
      <div className="card-hd">
        <div>
          <div className="section-title">Monthly Sales</div>
          <div className="section-sub">
            Revenue vs. units · {formatInteger(data.length)} months
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div className="legend">
            <div className="legend-item">
              <div
                className="legend-dot"
                style={{ background: 'var(--blue)' }}
              />
              Revenue
            </div>
            <div className="legend-item">
              <div
                className="legend-dot"
                style={{ background: 'var(--ink-200)' }}
              />
              Units
            </div>
          </div>
          <button className="ghost-btn">All →</button>
        </div>
      </div>
      <div className="card-body">
        <div className="bar-chart">
          {data.map((item, i) => {
            const revenueHeight = (item.revenue / maxRevenue) * 100
            const unitsHeight = (item.units / maxUnits) * 100
            return (
              <div key={i} className="bar-group">
                <div
                  className="bar-col secondary"
                  style={{ height: `${unitsHeight}px` }}
                />
                <div
                  className="bar-col primary"
                  style={{ height: `${revenueHeight}px` }}
                />
              </div>
            )
          })}
        </div>
        <div className="bar-labels">
          {data.map((item, i) => (
            <div key={i} className="bar-label">
              {item.month}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

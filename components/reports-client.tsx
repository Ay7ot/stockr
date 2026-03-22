'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { NairaPrice } from '@/components/naira-price'
import { PaginationBar } from '@/components/pagination-bar'
import { SaleLineDetailDialog } from '@/components/sale-line-detail-dialog'
import { SaleLinesTable } from '@/components/sale-lines-table'
import { useReportForDay } from '@/hooks/use-report-for-day'
import { useSaleLinesPage } from '@/hooks/use-sale-lines-page'
import { useUser } from '@/hooks/use-user'
import { parseInputDate, toInputDate } from '@/lib/date-local'
import type { RecentSaleRow } from '@/lib/sales'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { formatInteger } from '@/lib/format-numbers'

const LINE_PAGE_SIZE = 25

export function ReportsClient() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()
  const [dayStr, setDayStr] = useState(() => toInputDate(new Date()))
  const selectedDay = useMemo(() => parseInputDate(dayStr), [dayStr])
  const [reportTab, setReportTab] = useState<'summary' | 'lines'>('summary')
  const [linePage, setLinePage] = useState(1)
  const [detailRow, setDetailRow] = useState<RecentSaleRow | null>(null)

  const { data: report, isLoading: reportLoading } = useReportForDay(selectedDay)
  const { data: linePageData, isLoading: linesLoading, isFetching: linesFetching } =
    useSaleLinesPage({
      page: linePage,
      pageSize: LINE_PAGE_SIZE,
      range: { from: selectedDay, to: selectedDay },
      enabled: reportTab === 'lines',
    })

  useEffect(() => {
    setLinePage(1)
  }, [dayStr, reportTab])

  const dayLabel = useMemo(
    () => selectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    [selectedDay]
  )

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const layoutUser = {
    email: user?.email ?? '',
    profile: user?.profile
      ? { name: user.profile.name, role: user.profile.role }
      : undefined,
  }

  if (isLoading || !user) {
    return null
  }

  const lines = report?.lines ?? []
  const totalRevenue = report?.totalRevenue ?? 0
  const totalUnits = report?.totalUnits ?? 0
  const transactionCount = report?.transactionCount ?? 0
  const lineRows = linePageData?.rows ?? []
  const lineTotal = linePageData?.total ?? 0
  const linesTableLoading = linesLoading || linesFetching

  return (
    <DashboardLayout user={layoutUser} title="Daily Reports">
      <div className="page-header">
        <div>
          <div className="page-heading">Daily Reports</div>
          <div className="page-sub">
            Revenue and sales for{' '}
            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
              {dayLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Date
          </label>
          <input
            type="date"
            className="input"
            value={dayStr}
            onChange={(e) => setDayStr(e.target.value)}
            style={{ width: '170px' }}
          />
        </div>
        <div className="tab-bar" role="tablist" aria-label="Report view">
          <button
            type="button"
            role="tab"
            aria-selected={reportTab === 'summary'}
            className={`tab ${reportTab === 'summary' ? 'active' : ''}`}
            onClick={() => setReportTab('summary')}
          >
            Summary
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={reportTab === 'lines'}
            className={`tab ${reportTab === 'lines' ? 'active' : ''}`}
            onClick={() => setReportTab('lines')}
          >
            Line items
          </button>
        </div>
      </div>

      <div className="kpi-grid mb-6">
        <div className="card p-5">
          <div className="text-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.8px' }}>
            Revenue
          </div>
          <div className="kpi-value-responsive">
            <NairaPrice value={totalRevenue} />
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.8px' }}>
            Units sold
          </div>
          <div className="kpi-value-responsive">
            {formatInteger(totalUnits)}
          </div>
        </div>
      </div>

      {reportTab === 'summary' && (
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <div className="section-title">By product</div>
              <div className="section-sub">{reportLoading ? 'Loading…' : `${lines.length} products`}</div>
            </div>
          </div>
          {reportLoading ? (
            <div className="p-6">
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-md"
                    style={{
                      background: 'var(--ink-100)',
                      animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : lines.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 px-4"
              style={{ minHeight: '280px' }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--ink-300)', marginBottom: '16px' }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>
                No sales on {dayLabel}
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((row) => (
                    <tr key={row.productId} className="cursor-default">
                      <td style={{ fontWeight: 500 }}>{row.productName}</td>
                      <td className="text-right">{formatInteger(row.quantitySold)}</td>
                      <td className="text-right">
                        <NairaPrice value={row.revenue} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {reportTab === 'lines' && (
        <div className="table-card">
          <div className="table-toolbar">
            <div>
              <div className="section-title">Line items</div>
              <div className="section-sub">
                {linesTableLoading ? 'Loading…' : `${formatInteger(lineTotal)} lines`}
              </div>
            </div>
          </div>
          <SaleLinesTable
            rows={lineRows}
            loading={linesTableLoading}
            emptyMessage={`No sale lines on ${dayLabel}`}
            onRowClick={setDetailRow}
          />
          {lineTotal > 0 && (
            <PaginationBar
              page={linePage}
              pageSize={LINE_PAGE_SIZE}
              total={lineTotal}
              onPageChange={setLinePage}
            />
          )}
        </div>
      )}

      {detailRow && (
        <SaleLineDetailDialog
          key={detailRow.saleItemId}
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </DashboardLayout>
  )
}

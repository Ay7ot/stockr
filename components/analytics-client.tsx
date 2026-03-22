'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { NairaPrice } from '@/components/naira-price'
import { PaginationBar } from '@/components/pagination-bar'
import { SaleLineDetailDialog } from '@/components/sale-line-detail-dialog'
import { SaleLinesTable } from '@/components/sale-lines-table'
import { useSaleLinesPage } from '@/hooks/use-sale-lines-page'
import { useUser } from '@/hooks/use-user'
import { parseInputDate, toInputDate } from '@/lib/date-local'
import type { RecentSaleRow } from '@/lib/sales'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { formatInteger } from '@/lib/format-numbers'

const PAGE_SIZE = 25

type RangePreset = 'all' | '7' | '30' | '90' | 'custom'

function shiftDaysFromToday(days: number): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return { from: toInputDate(from), to: toInputDate(to) }
}

export function AnalyticsClient() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()
  const [preset, setPreset] = useState<RangePreset>('30')
  const [fromStr, setFromStr] = useState(() => shiftDaysFromToday(30).from)
  const [toStr, setToStr] = useState(() => shiftDaysFromToday(30).to)
  const [page, setPage] = useState(1)
  const [detailRow, setDetailRow] = useState<RecentSaleRow | null>(null)

  const range =
    preset === 'all'
      ? undefined
      : { from: parseInputDate(fromStr), to: parseInputDate(toStr) }

  const {
    data,
    isLoading: linesLoading,
    isFetching,
    isError,
    error,
  } = useSaleLinesPage({
    page,
    pageSize: PAGE_SIZE,
    range,
  })

  useEffect(() => {
    setPage(1)
  }, [preset, fromStr, toStr])

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const layoutUser = useMemo(
    () => ({
      email: user?.email ?? '',
      profile: user?.profile
        ? { name: user.profile.name, role: user.profile.role }
        : undefined,
    }),
    [user]
  )

  const applyPreset = (p: RangePreset) => {
    setPreset(p)
    if (p === 'all') return
    const days = p === '7' ? 7 : p === '30' ? 30 : 90
    const next = shiftDaysFromToday(days)
    setFromStr(next.from)
    setToStr(next.to)
  }

  if (isLoading || !user) {
    return null
  }

  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const stats = data?.stats ?? { totalRevenue: 0, totalUnits: 0, transactionCount: 0 }
  const loading = linesLoading || isFetching

  const rangeDesc = useMemo(() => {
    if (preset === 'all') return 'All time'
    if (preset === '7') return 'Last 7 days'
    if (preset === '30') return 'Last 30 days'
    if (preset === '90') return 'Last 90 days'
    const from = parseInputDate(fromStr)
    const to = parseInputDate(toStr)
    return `${from.toLocaleDateString()} – ${to.toLocaleDateString()}`
  }, [preset, fromStr, toStr])

  return (
    <DashboardLayout user={layoutUser} title="Analytics">
      <div className="page-header mb-6">
        <div>
          <div className="page-heading">Analytics</div>
          <div className="page-sub">Sales history · {rangeDesc}</div>
        </div>
      </div>

      <div className="kpi-grid mb-6">
        <div className="card p-5">
          <div className="text-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.8px' }}>
            Revenue
          </div>
          <div className="kpi-value-responsive">
            <NairaPrice value={stats.totalRevenue} />
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs uppercase mb-2" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.8px' }}>
            Units sold
          </div>
          <div className="kpi-value-responsive">
            {formatInteger(stats.totalUnits)}
          </div>
        </div>
      </div>

      <div className="card mb-6" style={{ padding: '16px 20px' }}>
        <div className="filter-chips">
          <button
            type="button"
            className={`chip ${preset === 'all' ? 'active' : ''}`}
            onClick={() => applyPreset('all')}
          >
            All time
          </button>
          <button
            type="button"
            className={`chip ${preset === '7' ? 'active' : ''}`}
            onClick={() => applyPreset('7')}
          >
            Last 7 days
          </button>
          <button
            type="button"
            className={`chip ${preset === '30' ? 'active' : ''}`}
            onClick={() => applyPreset('30')}
          >
            Last 30 days
          </button>
          <button
            type="button"
            className={`chip ${preset === '90' ? 'active' : ''}`}
            onClick={() => applyPreset('90')}
          >
            Last 90 days
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <div className="section-title">Sale history</div>
            <div className="section-sub">
              {isError ? 'Error' : loading ? 'Loading…' : `${formatInteger(total)} lines`}
            </div>
          </div>
        </div>
        {isError ? (
          <div className="p-6" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
            <p className="text-sm m-0">
              {error instanceof Error ? error.message : 'Could not load data'}
            </p>
          </div>
        ) : (
          <>
            <SaleLinesTable
              rows={rows}
              loading={loading}
              emptyMessage="No sale lines match this range."
              onRowClick={setDetailRow}
            />
            {total > 0 && (
              <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

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

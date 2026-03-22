'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { KPICard } from '@/components/kpi-card'
import { ProductTable } from '@/components/product-table'
import { ProductFormDialog } from '@/components/product-form'
import { ProductDeleteDialog } from '@/components/product-delete-dialog'
import { InventoryUnitsDialog } from '@/components/inventory-units-dialog'
import { MonthlyChart } from '@/components/monthly-chart'
import { ActivityFeed } from '@/components/activity-feed'
import { TableAnimations } from '@/components/table-animations'
import { useUser } from '@/hooks/use-user'
import { useProducts } from '@/hooks/use-products'
import { useTodaySalesStats } from '@/hooks/use-sales-stats'
import { useRecentSales } from '@/hooks/use-recent-sales'
import { useMonthlySales } from '@/hooks/use-monthly-sales'
import { NairaPrice } from '@/components/naira-price'
import { formatInteger } from '@/lib/format-numbers'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useCallback } from 'react'
import type { Product } from '@/types/database'

export function DashboardClient() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()
  const { data, isLoading: productsLoading } = useProducts()
  const products = data?.products ?? []
  const productCatalogCount = data?.count ?? products.length
  const { data: todayStats } = useTodaySalesStats()
  const todayRevenue = todayStats?.revenue ?? 0
  const todayUnits = todayStats?.unitsSold ?? 0
  const todayTransactions = todayStats?.transactionCount ?? 0
  const { data: recentSales } = useRecentSales(10)
  const { data: monthlyData } = useMonthlySales(8)
  const isAdmin = user?.profile?.role === 'admin'

  const [formOpen, setFormOpen] = useState(false)
  const [formProduct, setFormProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [unitsProduct, setUnitsProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  const closeForm = useCallback(() => {
    setFormOpen(false)
    setFormProduct(null)
  }, [])

  const openAdd = useCallback(() => {
    setFormProduct(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((p: Product) => {
    setFormProduct(p)
    setFormOpen(true)
  }, [])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, searchQuery])

  const activities = useMemo(() => {
    if (!recentSales || recentSales.length === 0) return []
    
    return recentSales.map((sale) => {
      const now = new Date()
      const saleDate = new Date(sale.createdAt)
      const diffMs = now.getTime() - saleDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      let timeStr = ''
      if (diffMins < 1) timeStr = 'Just now'
      else if (diffMins < 60) timeStr = `${diffMins} min ago`
      else if (diffMins < 1440) timeStr = `${Math.floor(diffMins / 60)} hr ago`
      else timeStr = `${Math.floor(diffMins / 1440)} day ago`
      
      const qtyStr = sale.quantity > 1 ? `${sale.quantity}× ` : ''
      const unitInfo = sale.unitIdentifier 
        ? ` (${sale.unitIdentifierKind}: ${sale.unitIdentifier})`
        : ''
      
      return {
        id: sale.saleItemId,
        type: 'success' as const,
        message: `Sold ${qtyStr}<strong>${sale.productName}</strong>${unitInfo} — by ${sale.soldBy}`,
        time: timeStr,
      }
    })
  }, [recentSales])

  if (isLoading || !user) {
    return null
  }

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const chartData = monthlyData && monthlyData.length > 0 
    ? monthlyData 
    : [{ month: 'No data', revenue: 0, units: 0 }]

  const layoutUser = {
    email: user.email,
    profile: user.profile
      ? { name: user.profile.name, role: user.profile.role }
      : undefined,
  }

  return (
    <>
      <DashboardLayout
        user={layoutUser}
        title="Dashboard"
        showAddButton={isAdmin}
        onAddClick={openAdd}
        alertCount={0}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search inventory…"
      >
      <div className="page-header">
        <div>
          <div className="page-heading">Overview</div>
          <div className="page-sub">{formattedDate} · Live inventory</div>
        </div>
        <button 
          type="button" 
          className="btn btn-secondary btn-sm"
          onClick={() => router.push('/analytics')}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          This Month
        </button>
      </div>

      <div className="kpi-grid">
        <KPICard
          label="Revenue"
          value={<NairaPrice value={todayRevenue} />}
          color="var(--blue)"
          colorLight="var(--blue-light)"
          icon={
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          period="Today"
        />
        <KPICard
          label="Units Sold"
          value={formatInteger(todayUnits)}
          color="var(--green)"
          colorLight="var(--green-light)"
          icon={
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          }
          period="Today"
        />
        <KPICard
          label="Products"
          value={formatInteger(productCatalogCount)}
          color="var(--amber)"
          colorLight="var(--amber-light)"
          icon={
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          }
          period="In catalog"
        />
        <KPICard
          label="Transactions"
          value={formatInteger(todayTransactions)}
          color="var(--purple)"
          colorLight="var(--purple-light)"
          icon={
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          }
          period="Today"
        />
      </div>

      <ProductTable
        products={filteredProducts}
        isAdmin={isAdmin}
        isLoading={productsLoading}
        onEdit={isAdmin ? openEdit : undefined}
        onDelete={isAdmin ? (p) => setDeleteTarget(p) : undefined}
        onManageUnits={isAdmin ? (p) => setUnitsProduct(p) : undefined}
        hideSearch={true}
      />

      <div className="bottom-grid">
        <MonthlyChart data={chartData} />
        <ActivityFeed activities={activities} />
      </div>

      <TableAnimations />
    </DashboardLayout>

    {formOpen && (
      <ProductFormDialog
        key={formProduct?.id ?? 'new'}
        product={formProduct}
        onClose={closeForm}
      />
    )}

    {deleteTarget && (
      <ProductDeleteDialog
        key={deleteTarget.id}
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    )}

    {unitsProduct && (
      <InventoryUnitsDialog
        key={unitsProduct.id}
        product={unitsProduct}
        onClose={() => setUnitsProduct(null)}
      />
    )}
  </>
  )
}

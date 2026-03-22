'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProductTable } from '@/components/product-table'
import { ProductFormDialog } from '@/components/product-form'
import { ProductDeleteDialog } from '@/components/product-delete-dialog'
import { InventoryUnitsDialog } from '@/components/inventory-units-dialog'
import { useUser } from '@/hooks/use-user'
import { useProducts } from '@/hooks/use-products'
import { formatInteger } from '@/lib/format-numbers'
import type { Product } from '@/types/database'

const PAGE_SIZE = 20

export function ProductsClient() {
  const { data: user, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useProducts(page, PAGE_SIZE)

  const products = data?.products ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const [formOpen, setFormOpen] = useState(false)
  const [formProduct, setFormProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [unitsProduct, setUnitsProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login')
    }
  }, [user, userLoading, router])

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

  if (userLoading || !user) {
    return null
  }

  const isAdmin = user.profile?.role === 'admin'

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
        title="Products"
        showAddButton={isAdmin}
        onAddClick={openAdd}
        alertCount={0}
        topbarShowSearch={false}
      >
        <div className="page-header">
          <div>
            <div className="page-heading">Products</div>
            <div className="page-sub">
              {isLoading
                ? 'Loading…'
                : `${formatInteger(products.length)} items · Live inventory`}
            </div>
          </div>
          {isAdmin && (
            <button type="button" className="btn btn-primary btn-sm" onClick={openAdd}>
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Product
            </button>
          )}
        </div>

        {isError && (
          <div
            className="rounded-md p-3 text-sm mb-4"
            style={{ background: 'var(--red-light)', color: 'var(--red)' }}
            role="alert"
          >
            {error instanceof Error ? error.message : 'Failed to load products.'}
          </div>
        )}

        <ProductTable
          products={products}
          isAdmin={isAdmin}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={(p) => setDeleteTarget(p)}
          onManageUnits={isAdmin ? (p) => setUnitsProduct(p) : undefined}
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
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

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SaleLineDetailsView } from '@/types/database'

export type TodayStats = {
  revenue: number
  unitsSold: number
  transactionCount: number
}

function startEndOfLocalDay(d: Date): { start: string; end: string } {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  const end = new Date(d)
  end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

export async function getTodayStats(
  supabase: SupabaseClient<Database>,
  day: Date = new Date()
): Promise<{ data: TodayStats; error: Error | null }> {
  const { start, end } = startEndOfLocalDay(day)

  const { data: salesRows, error: salesErr } = await supabase
    .from('sales')
    .select('id')
    .gte('created_at', start)
    .lte('created_at', end)

  if (salesErr) {
    return { data: { revenue: 0, unitsSold: 0, transactionCount: 0 }, error: new Error(salesErr.message) }
  }

  const saleIds = (salesRows ?? []).map((s) => s.id)
  const transactionCount = saleIds.length

  if (saleIds.length === 0) {
    return { data: { revenue: 0, unitsSold: 0, transactionCount: 0 }, error: null }
  }

  const { data: items, error: itemsErr } = await supabase
    .from('sale_items')
    .select('unit_price, quantity_sold')
    .in('sale_id', saleIds)

  if (itemsErr) {
    return { data: { revenue: 0, unitsSold: 0, transactionCount }, error: new Error(itemsErr.message) }
  }

  let revenue = 0
  let unitsSold = 0
  for (const row of items ?? []) {
    const u = Number(row.quantity_sold)
    const p = Number(row.unit_price)
    revenue += p * u
    unitsSold += u
  }

  return { data: { revenue, unitsSold, transactionCount }, error: null }
}

export type RecentSaleRow = {
  /** sale_items.id — unique per table row */
  saleItemId: string
  saleId: string
  createdAt: string
  soldBy: string
  customerName: string
  customerPhone: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
  /** Present when the line sold a serialized unit */
  unitIdentifier: string | null
  unitIdentifierKind: string | null
}

export async function getRecentSales(
  supabase: SupabaseClient<Database>,
  limit = 25
): Promise<{ data: RecentSaleRow[]; error: Error | null }> {
  const { data: sales, error } = await supabase
    .from('sales')
    .select(
      `
      id,
      created_at,
      sold_by,
      customer_name,
      customer_phone,
      sale_items (
        id,
        quantity_sold,
        unit_price,
        inventory_unit_id,
        products (name),
        inventory_units (identifier, identifier_kind)
      )
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  const rows: RecentSaleRow[] = []
  for (const s of sales ?? []) {
    const items = s.sale_items as
      | Array<{
          id: string
          quantity_sold: number
          unit_price: number
          products: { name: string } | null
          inventory_units: {
            identifier: string
            identifier_kind: string
          } | null
        }>
      | null
    for (const it of items ?? []) {
      const qty = Number(it.quantity_sold)
      const price = Number(it.unit_price)
      const unit = it.inventory_units
      rows.push({
        saleItemId: it.id,
        saleId: s.id,
        createdAt: s.created_at,
        soldBy: s.sold_by,
        customerName: s.customer_name ?? '',
        customerPhone: s.customer_phone ?? '',
        productName: it.products?.name ?? 'Product',
        quantity: qty,
        unitPrice: price,
        lineTotal: price * qty,
        unitIdentifier: unit?.identifier ?? null,
        unitIdentifierKind: unit?.identifier_kind ?? null,
      })
      if (rows.length >= limit) break
    }
    if (rows.length >= limit) break
  }

  return { data: rows, error: null }
}

function mapSaleLineDetail(row: SaleLineDetailsView): RecentSaleRow {
  const qty = Number(row.quantity_sold)
  const price = Number(row.unit_price)
  return {
    saleItemId: row.sale_item_id,
    saleId: row.sale_id,
    createdAt: row.sale_created_at,
    soldBy: row.sold_by,
    customerName: row.customer_name ?? '',
    customerPhone: row.customer_phone ?? '',
    productName: row.product_name,
    quantity: qty,
    unitPrice: price,
    lineTotal: price * qty,
    unitIdentifier: row.unit_identifier,
    unitIdentifierKind: row.unit_identifier_kind,
  }
}

export type SaleLinesPageParams = {
  page: number
  pageSize: number
  /** Inclusive local calendar range. Omit for all-time. */
  range?: { from: Date; to: Date }
}

export type SaleLinesPageResult = {
  rows: RecentSaleRow[]
  total: number
  stats: {
    totalRevenue: number
    totalUnits: number
    transactionCount: number
  }
}

export async function getSaleLinesPage(
  supabase: SupabaseClient<Database>,
  params: SaleLinesPageParams
): Promise<{ data: SaleLinesPageResult; error: Error | null }> {
  const page = Math.max(1, Math.floor(params.page))
  const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize)))
  const offset = (page - 1) * pageSize

  let q = supabase
    .from('sale_line_details')
    .select('*', { count: 'exact' })
    .order('sale_created_at', { ascending: false })

  if (params.range) {
    const start = new Date(params.range.from)
    start.setHours(0, 0, 0, 0)
    const end = new Date(params.range.to)
    end.setHours(23, 59, 59, 999)
    q = q.gte('sale_created_at', start.toISOString()).lte('sale_created_at', end.toISOString())
  }

  const { data, error, count } = await q.range(offset, offset + pageSize - 1)

  if (error) {
    return {
      data: { rows: [], total: 0, stats: { totalRevenue: 0, totalUnits: 0, transactionCount: 0 } },
      error: new Error(error.message),
    }
  }

  const rows = (data ?? []).map((row) => mapSaleLineDetail(row as SaleLineDetailsView))

  let qStats = supabase
    .from('sale_line_details')
    .select('quantity_sold, unit_price, sale_id')

  if (params.range) {
    const start = new Date(params.range.from)
    start.setHours(0, 0, 0, 0)
    const end = new Date(params.range.to)
    end.setHours(23, 59, 59, 999)
    qStats = qStats
      .gte('sale_created_at', start.toISOString())
      .lte('sale_created_at', end.toISOString())
  }

  const { data: statsData } = await qStats

  let totalRevenue = 0
  let totalUnits = 0
  const saleIds = new Set<string>()

  for (const row of (statsData ?? []) as Array<{ quantity_sold: number; unit_price: number; sale_id: string }>) {
    const qty = Number(row.quantity_sold)
    const price = Number(row.unit_price)
    totalRevenue += price * qty
    totalUnits += qty
    saleIds.add(row.sale_id)
  }

  return {
    data: {
      rows,
      total: count ?? 0,
      stats: { totalRevenue, totalUnits, transactionCount: saleIds.size },
    },
    error: null,
  }
}

export type ReportLine = {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
}

export async function getReportForDay(
  supabase: SupabaseClient<Database>,
  day: Date
): Promise<{
  data: { lines: ReportLine[]; totalRevenue: number; totalUnits: number; transactionCount: number }
  error: Error | null
}> {
  const { start, end } = startEndOfLocalDay(day)

  const { data: salesRows, error: salesErr } = await supabase
    .from('sales')
    .select('id')
    .gte('created_at', start)
    .lte('created_at', end)

  if (salesErr) {
    return {
      data: { lines: [], totalRevenue: 0, totalUnits: 0, transactionCount: 0 },
      error: new Error(salesErr.message),
    }
  }

  const saleIds = (salesRows ?? []).map((s) => s.id)
  if (saleIds.length === 0) {
    return { data: { lines: [], totalRevenue: 0, totalUnits: 0, transactionCount: 0 }, error: null }
  }

  const { data: items, error: itemsErr } = await supabase
    .from('sale_items')
    .select('product_id, quantity_sold, unit_price, products (name)')
    .in('sale_id', saleIds)

  if (itemsErr) {
    return {
      data: { lines: [], totalRevenue: 0, totalUnits: 0, transactionCount: 0 },
      error: new Error(itemsErr.message),
    }
  }

  const map = new Map<
    string,
    { name: string; quantitySold: number; revenue: number }
  >()

  let totalRevenue = 0
  let totalUnits = 0

  for (const row of items ?? []) {
    const r = row as {
      product_id: string
      quantity_sold: number
      unit_price: number
      products: { name: string } | null
    }
    const name = r.products?.name ?? 'Product'
    const qty = Number(r.quantity_sold)
    const price = Number(r.unit_price)
    const lineRev = price * qty
    const cur = map.get(r.product_id)
    if (cur) {
      cur.quantitySold += qty
      cur.revenue += lineRev
    } else {
      map.set(r.product_id, { name, quantitySold: qty, revenue: lineRev })
    }
    totalRevenue += lineRev
    totalUnits += qty
  }

  const lines: ReportLine[] = [...map.entries()].map(([productId, v]) => ({
    productId,
    productName: v.name,
    quantitySold: v.quantitySold,
    revenue: v.revenue,
  }))

  lines.sort((a, b) => b.revenue - a.revenue)

  return { data: { lines, totalRevenue, totalUnits, transactionCount: saleIds.length }, error: null }
}

export type MonthlyStats = {
  month: string
  revenue: number
  units: number
}

export async function getMonthlySales(
  supabase: SupabaseClient<Database>,
  monthsBack = 8
): Promise<{ data: MonthlyStats[]; error: Error | null }> {
  const now = new Date()
  const monthsData: MonthlyStats[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    const monthLabel = targetMonth.toLocaleDateString('en-US', { month: 'short' })

    const { data: salesRows, error: salesErr } = await supabase
      .from('sales')
      .select('id')
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString())

    if (salesErr) {
      continue
    }

    const saleIds = (salesRows ?? []).map((s) => s.id)
    
    if (saleIds.length === 0) {
      monthsData.push({ month: monthLabel, revenue: 0, units: 0 })
      continue
    }

    const { data: items, error: itemsErr } = await supabase
      .from('sale_items')
      .select('unit_price, quantity_sold')
      .in('sale_id', saleIds)

    if (itemsErr) {
      monthsData.push({ month: monthLabel, revenue: 0, units: 0 })
      continue
    }

    let revenue = 0
    let units = 0
    for (const row of items ?? []) {
      const u = Number(row.quantity_sold)
      const p = Number(row.unit_price)
      revenue += p * u
      units += u
    }

    monthsData.push({ month: monthLabel, revenue, units })
  }

  return { data: monthsData, error: null }
}

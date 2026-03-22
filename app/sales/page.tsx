import { Metadata } from 'next'
import { SalesClient } from '@/components/sales-client'

export const metadata: Metadata = {
  title: "Sales",
  description: "Record new sales transactions, track recent sales activity, and manage inventory units. View sale history and details.",
  openGraph: {
    title: "Sales | Stockr",
    description: "Record new sales transactions and track recent sales activity.",
  },
}

export default function SalesPage() {
  return <SalesClient />
}

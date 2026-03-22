import { Metadata } from 'next'
import { ProductsClient } from '@/components/products-client'

export const metadata: Metadata = {
  title: "Products",
  description: "Manage your product catalog, track inventory levels, and update pricing. Add new products or edit existing ones.",
  openGraph: {
    title: "Products | Stockr",
    description: "Manage your product catalog, track inventory levels, and update pricing.",
  },
}

export default function ProductsPage() {
  return <ProductsClient />
}

import { Metadata } from 'next'
import { ReportsClient } from '@/components/reports-client'

export const metadata: Metadata = {
  title: "Reports",
  description: "Generate daily, weekly, and monthly sales reports. Analyze product performance and revenue trends.",
  openGraph: {
    title: "Reports | Stockr",
    description: "Generate daily, weekly, and monthly sales reports. Analyze product performance.",
  },
}

export default function ReportsPage() {
  return <ReportsClient />
}

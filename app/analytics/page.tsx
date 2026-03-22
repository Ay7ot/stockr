import { Metadata } from 'next'
import { AnalyticsClient } from '@/components/analytics-client'

export const metadata: Metadata = {
  title: "Analytics",
  description: "Deep dive into sales analytics, trends, and insights. View detailed transaction history and performance metrics.",
  openGraph: {
    title: "Analytics | Stockr",
    description: "Deep dive into sales analytics, trends, and insights.",
  },
}

export default function AnalyticsPage() {
  return <AnalyticsClient />
}

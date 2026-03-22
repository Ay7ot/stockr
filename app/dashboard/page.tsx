import { Metadata } from 'next'
import { DashboardClient } from '@/components/dashboard-client'

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View real-time sales metrics, inventory overview, and business performance at a glance.",
  openGraph: {
    title: "Dashboard | Stockr",
    description: "View real-time sales metrics, inventory overview, and business performance at a glance.",
  },
}

export default function DashboardPage() {
  return <DashboardClient />
}

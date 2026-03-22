import { getUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Stockr — Inventory & Sales Tracker",
  description: "Smart inventory and sales tracking for gadget businesses. Track stock, record sales, manage staff, and view real-time reports from anywhere.",
  openGraph: {
    title: "Stockr — Smart Inventory & Sales Tracking for Gadget Businesses",
    description: "Track inventory, record sales, and view daily reports for your gadget business. Mobile-first, intuitive, and powerful.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Stockr - Inventory & Sales Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockr — Smart Inventory & Sales Tracking for Gadget Businesses",
    description: "Track inventory, record sales, and view daily reports for your gadget business.",
    images: ["/og-image.png"],
  },
}

export default async function HomePage() {
  const user = await getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}

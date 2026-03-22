import { Metadata } from 'next'
import { SettingsClient } from '@/components/settings-client'

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your Stockr application settings, preferences, and business information.",
  openGraph: {
    title: "Settings | Stockr",
    description: "Configure your Stockr application settings and preferences.",
  },
}

export default function SettingsPage() {
  return <SettingsClient />
}

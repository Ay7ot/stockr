import { Metadata } from 'next'
import { ProfileClient } from '@/components/profile-client'

export const metadata: Metadata = {
  title: "Profile",
  description: "View and manage your profile information, account settings, and preferences.",
  openGraph: {
    title: "Profile | Stockr",
    description: "View and manage your profile information and account settings.",
  },
}

export default function ProfilePage() {
  return <ProfileClient />
}

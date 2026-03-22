import { Metadata } from 'next'
import { StaffClient } from '@/components/staff-client'

export const metadata: Metadata = {
  title: "Staff Management",
  description: "Manage staff accounts, assign roles, and track team activity. Add new staff members and control access levels.",
  openGraph: {
    title: "Staff Management | Stockr",
    description: "Manage staff accounts, assign roles, and track team activity.",
  },
}

export default function StaffPage() {
  return <StaffClient />
}

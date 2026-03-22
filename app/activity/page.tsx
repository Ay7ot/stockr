import { redirect } from 'next/navigation'

/** Old URL — sale line ledger lives under Analytics now */
export default function ActivityRedirectPage() {
  redirect('/analytics')
}

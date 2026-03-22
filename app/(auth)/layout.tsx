import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Stockr account to manage inventory, record sales, and view reports.",
  openGraph: {
    title: "Sign In | Stockr",
    description: "Sign in to your Stockr account to manage your gadget business.",
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

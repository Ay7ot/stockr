'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto w-full max-w-sm">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg" style={{ background: 'var(--ink-800)' }}>
              G
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--ink-900)' }}>
                Gadget Inventory
              </h1>
            </div>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sign in to manage your inventory
          </p>
        </div>

        <div
          className="mt-8 px-6 py-8 rounded-lg"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 'var(--r-lg)'
          }}
        >
          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--ink-700)' }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: 'var(--ink-700)' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input w-full"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="rounded-md p-3 text-sm" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full justify-center"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--ink-400)' }}>
          Contact your administrator for access
        </p>
      </div>
    </div>
  )
}
